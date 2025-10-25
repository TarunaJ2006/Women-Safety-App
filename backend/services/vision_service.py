#!/usr/bin/env python3
"""
VisionSafetyCore — Portable Real-time Vision + Emotion Detection Service
Runs in a background thread and exposes safe JSON-ready status for FastAPI
"""

import cv2
import numpy as np
import threading
import time
from datetime import datetime
from ultralytics import YOLO
import torch

# Optional imports for audio, but safe if not present
try:
    import sounddevice as sd
except ImportError:
    sd = None


class VisionSafetyCore:
    def __init__(self):
        print("🎥 Initializing Real-time Vision Safety Core...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🧠 Using device: {self.device}")

        # Load YOLO models
        self.model_people = YOLO("yolov8n.pt")  # for person detection
        self.model_pose = YOLO("yolov8n-pose.pt")  # for posture estimation
        print("✅ YOLO models loaded")

        # Optional emotion model (whisper-based)
        try:
            from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
            self.emotion_model_id = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
            self.emotion_model = AutoModelForAudioClassification.from_pretrained(self.emotion_model_id)
            self.emotion_extractor = AutoFeatureExtractor.from_pretrained(self.emotion_model_id)
            self.id2label = self.emotion_model.config.id2label
            print("✅ Emotion model loaded successfully")
        except Exception as e:
            print(f"⚠️ Emotion model not available: {e}")
            self.emotion_model = None
            self.id2label = {0: "neutral"}

        # Camera setup
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise RuntimeError("❌ Cannot access camera. Ensure OBS or webcam is available.")

        self.lock = threading.Lock()
        self.is_running = False
        self.latest_status = {
            "people": 0,
            "motion": False,
            "audio": False,
            "pose_risk": False,
            "emotion": "neutral",
            "confidence": 0.0,
            "last_alert": None,
        }

        self.prev_frame = None
        print("🎬 VisionSafetyCore initialized.")

    # ---------------------------
    # Core Processing Functions
    # ---------------------------

    def detect_people(self, frame):
        results = self.model_people(frame, conf=0.4, verbose=False)
        count = 0
        for box in results[0].boxes:
            if self.model_people.names[int(box.cls[0])] == "person":
                count += 1
        return count

    def detect_pose_risk(self, frame):
        poses = self.model_pose(frame, conf=0.4, verbose=False)
        risky = False
        for p in poses:
            for box in p.boxes:
                if hasattr(box, "keypoints") and len(box.keypoints) >= 2:
                    hand_y = box.keypoints[0][1]
                    shoulder_y = box.keypoints[1][1]
                    if hand_y < shoulder_y:
                        risky = True
        return risky

    def detect_motion(self, prev_frame, curr_frame, threshold=5000):
        if prev_frame is None:
            return False
        diff = cv2.absdiff(cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY),
                           cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY))
        motion = np.sum(diff) / 255
        return motion > threshold

    def detect_audio(self, dur=0.5, fs=16000, threshold=0.06):
        if sd is None:
            return False
        try:
            record = sd.rec(int(dur * fs), samplerate=fs, channels=1)
            sd.wait()
            ampl = np.max(np.abs(record))
            return ampl > threshold
        except Exception:
            return False

    def detect_emotion(self):
        """Placeholder emotion; could be linked to audio model."""
        return "neutral", 0.0

    # ---------------------------
    # Worker Thread
    # ---------------------------

    def process_loop(self):
        print("🎧 Vision processing loop started")
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.2)
                continue

            people = self.detect_people(frame)
            pose_risk = self.detect_pose_risk(frame)
            motion = self.detect_motion(self.prev_frame, frame)
            audio = self.detect_audio()
            emotion, confidence = self.detect_emotion()

            with self.lock:
                self.latest_status = {
                    "people": int(people),
                    "motion": bool(motion),
                    "audio": bool(audio),
                    "pose_risk": bool(pose_risk),
                    "emotion": str(emotion),
                    "confidence": float(confidence),
                    "last_alert": datetime.now().strftime("%H:%M:%S"),
                }

            self.prev_frame = frame.copy()
            time.sleep(0.1)

        print("🛑 Vision processing loop stopped")

    # ---------------------------
    # Public Methods
    # ---------------------------

    def start(self):
        if self.is_running:
            print("⚠️ Vision core already running")
            return
        print("🎥 Starting VisionSafetyCore...")
        self.is_running = True
        threading.Thread(target=self.process_loop, daemon=True).start()

    def stop(self):
        print("🛑 Stopping VisionSafetyCore...")
        self.is_running = False
        try:
            if self.cap.isOpened():
                self.cap.release()
        except Exception:
            pass
        print("✅ Vision service stopped.")

    def get_status(self):
        """Return JSON-serializable dict of latest status"""
        with self.lock:
            if self.latest_status is None:
                return {
                    "people": 0,
                    "motion": False,
                    "audio": False,
                    "pose_risk": False,
                    "emotion": "neutral",
                    "confidence": 0.0,
                    "last_alert": None,
                }

            def to_py(val):
                import numpy as np
                if isinstance(val, (np.bool_, bool)):
                    return bool(val)
                elif isinstance(val, (np.integer, int)):
                    return int(val)
                elif isinstance(val, (np.floating, float)):
                    return float(val)
                elif isinstance(val, dict):
                    return {k: to_py(v) for k, v in val.items()}
                elif isinstance(val, (list, tuple)):
                    return [to_py(v) for v in val]
                else:
                    return val

            return {k: to_py(v) for k, v in self.latest_status.items()}


# Global singleton instance
vision_core = VisionSafetyCore()

if __name__ == "__main__":
    print("🔬 Debugging VisionSafetyCore directly...")
    vision_core.start()
    try:
        while True:
            print(vision_core.get_status())
            time.sleep(2)
    except KeyboardInterrupt:
        vision_core.stop()
