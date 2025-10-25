#!/usr/bin/env python3
"""
Real-time Speech Emotion Recognition Core (for FastAPI)
"""

import numpy as np
import torch
import threading
import queue
import time
import sounddevice as sd
from datetime import datetime
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor


class RealTimeAudioEmotionCore:
    def __init__(self, model_id="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"):
        print("🎤 Initializing Real-time Speech Emotion Recognition Core...")
        self.model_id = model_id
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🧠 Using device: {self.device}")

        self.sample_rate = 16000
        self.chunk_duration = 3.0
        self.overlap = 1.0
        self.threshold = 0.3

        # Load model + extractor
        self.model = AutoModelForAudioClassification.from_pretrained(model_id)
        self.feature_extractor = AutoFeatureExtractor.from_pretrained(model_id)
        self.id2label = self.model.config.id2label
        self.model = self.model.to(self.device)

        # Buffers
        self.audio_queue = queue.Queue()
        self.audio_buffer = np.zeros(0, dtype=np.float32)

        # Status
        self.is_running = False
        self.current_emotion = "Neutral"
        self.current_confidence = 0.0

    # ----------------------------
    #   Audio Processing Logic
    # ----------------------------
    def _audio_callback(self, indata, frames, time_info, status):
        if status:
            print("⚠️ Audio status:", status)
        self.audio_queue.put(indata.copy())

    def _processor(self):
        print("🎧 Audio processor thread started")
        chunk_samples = int(self.chunk_duration * self.sample_rate)
        overlap_samples = int(self.overlap * self.sample_rate)

        while self.is_running:
            try:
                while not self.audio_queue.empty():
                    data = self.audio_queue.get()
                    self.audio_buffer = np.concatenate([self.audio_buffer, data.flatten()])

                    # process only when buffer is large enough
                    if len(self.audio_buffer) >= chunk_samples:
                        chunk = self.audio_buffer[:chunk_samples]
                        emotion, conf = self._infer(chunk)
                        if conf >= self.threshold:
                            self.current_emotion, self.current_confidence = emotion, conf
                            print(f"🕒 {datetime.now().strftime('%H:%M:%S')} | {emotion} ({conf:.2f})")

                        # retain overlap portion
                        self.audio_buffer = self.audio_buffer[chunk_samples - overlap_samples:]
                time.sleep(0.05)

            except Exception as e:
                print("❌ Processor error:", e)
                time.sleep(0.5)

    def _infer(self, audio):
        try:
            inputs = self.feature_extractor(
                audio,
                sampling_rate=self.sample_rate,
                return_tensors="pt",
                padding=True,
                truncation=True,
            )
            with torch.no_grad():
                logits = self.model(**{k: v.to(self.device) for k, v in inputs.items()}).logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]
            pred_id = torch.argmax(probs).item()
            return self.id2label[pred_id], probs[pred_id].item()
        except Exception as e:
            print("❌ Inference error:", e)
            return "Error", 0.0

    # ----------------------------
    #   Service Control
    # ----------------------------
    def start(self, device_index=None):
        if self.is_running:
            print("⚠️ Already running.")
            return
        self.is_running = True
        print("✅ Audio stream started")

        self.processor_thread = threading.Thread(target=self._processor, daemon=True)
        self.processor_thread.start()

        # Start mic input
        sd.InputStream(
            callback=self._audio_callback,
            channels=1,
            samplerate=self.sample_rate,
            blocksize=int(self.sample_rate * 0.1),
            device=device_index or 3,  # Default: MacBook Air mic
        ).start()

        print("✅ Audio emotion recognition service started.")

    def stop(self):
        self.is_running = False
        print("🛑 Audio service stopped")

    def get_status(self):
        return {"emotion": self.current_emotion, "confidence": self.current_confidence}


# Global instance for FastAPI import
audio_core = RealTimeAudioEmotionCore()

if __name__ == "__main__":
    audio_core.start(device_index=3)  # MacBook mic
    try:
        while True:
            print(audio_core.get_status())
            time.sleep(2)
    except KeyboardInterrupt:
        audio_core.stop()
