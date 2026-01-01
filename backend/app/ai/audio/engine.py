import logging
import numpy as np
import os
import onnxruntime as ort
from datetime import datetime
from transformers import AutoFeatureExtractor
from app.ai.base import BaseInferenceEngine
from typing import Any, Dict
import io
import librosa
import tempfile

logger = logging.getLogger(__name__)

class AudioEngine(BaseInferenceEngine):
    def __init__(self, artifacts_dir: str):
        self.artifacts_dir = artifacts_dir
        self.session = None
        self.feature_extractor = None
        self.sample_rate = 16000
        self._latest_result = {"emotion": "neutral", "confidence": 0.0, "active": False, "timestamp": None}
        self.id2label = {0: "angry", 1: "disgust", 2: "fearful", 3: "happy", 4: "neutral", 5: "sad", 6: "surprised"}

    def load_model(self, artifact_path: str = None) -> None:
        from app.ai.model_downloader import ensure_audio_model
        
        try:
            path = artifact_path or self.artifacts_dir
            
            # Ensure model is downloaded
            if not ensure_audio_model(path):
                logger.error("❌ Failed to prepare audio model")
                return
            
            logger.info(f"📁 Loading Audio AI from: {path}")
            self.feature_extractor = AutoFeatureExtractor.from_pretrained(path)
            self.session = ort.InferenceSession(
                os.path.join(path, "model.onnx"), 
                providers=['CPUExecutionProvider']
            )
            # Warm up the model
            dummy_input = np.zeros((1, 16000), dtype=np.float32)
            self.predict(dummy_input[0])
            logger.info("✅ Audio AI Model Loaded and Warmed Up")
        except Exception as e:
            logger.error(f"❌ Failed to load Audio AI model: {e}")

    def predict(self, audio_data: Any) -> Dict[str, Any]:
        if not self.session: 
            logger.warning("🚫 Prediction skipped: Model not loaded")
            return {"emotion": "none", "confidence": 0.0, "active": False}
        
        try:
            inputs = self.feature_extractor(audio_data, sampling_rate=self.sample_rate, return_tensors="np")
            input_data = inputs.get("input_values") if "input_values" in inputs else inputs.get("input_features")
            
            # Run inference
            outputs = self.session.run(None, {self.session.get_inputs()[0].name: input_data})
            logits = outputs[0][0]
            
            # Softmax
            probs = np.exp(logits - np.max(logits))
            probs /= probs.sum()
            
            pred_id = np.argmax(probs)
            result = {
                "emotion": self.id2label.get(pred_id, "unknown"),
                "confidence": float(probs[pred_id]),
                "active": True,
                "timestamp": datetime.now().isoformat()
            }
            return result
        except Exception as e:
            logger.error(f"❌ Audio Prediction Error: {e}")
            return {"emotion": "error", "confidence": 0.0, "active": False}

    def process_audio(self, audio_bytes: bytes):
        try:
            logger.info(f"📥 Received audio bytes: {len(audio_bytes)}")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_in:
                tmp_in.write(audio_bytes)
                in_path = tmp_in.name
            
            out_path = in_path + ".wav"
            
            # Convert webm to wav using ffmpeg directly
            import subprocess
            command = [
                'ffmpeg', '-y', '-i', in_path, 
                '-ar', str(self.sample_rate), 
                '-ac', '1', 
                out_path
            ]
            subprocess.run(command, capture_output=True, check=True)
            
            y, sr = librosa.load(out_path, sr=self.sample_rate)
            
            # Cleanup
            if os.path.exists(in_path): os.remove(in_path)
            if os.path.exists(out_path): os.remove(out_path)
            
            logger.info(f"🎵 Audio loaded: {len(y)} samples at {sr}Hz")
            
            if len(y) > 1600: 
                self._latest_result = self.predict(y)
                logger.info(f"🧠 Prediction: {self._latest_result['emotion']} ({self._latest_result['confidence']:.2f})")
            else:
                logger.warning("⚠️ Audio too short for prediction")
        except Exception as e: 
            logger.error(f"❌ Audio AI Error: {e}")
            if 'in_path' in locals() and os.path.exists(in_path): os.remove(in_path)
            if 'out_path' in locals() and os.path.exists(out_path): os.remove(out_path)

    @property
    def status(self) -> Dict[str, Any]:
        return self._latest_result

audio_service = AudioEngine("app/artifacts/audio")
