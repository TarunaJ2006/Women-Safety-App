import cv2
import numpy as np
import os
from datetime import datetime
from ultralytics import YOLO
from app.ai.base import BaseInferenceEngine
from typing import Any, Dict

class VisionEngine(BaseInferenceEngine):
    def __init__(self, artifacts_dir: str):
        self.artifacts_dir = artifacts_dir
        self.model_people = None
        self.model_pose = None
        self._latest_result = {
            "people_count": 0, "pose_risk": False, "motion_detected": False, "active": False, "timestamp": None
        }

    def load_model(self, artifact_path: str = None) -> None:
        path = artifact_path or self.artifacts_dir
        self.model_people = YOLO(os.path.join(path, "yolov8n.onnx"), task="detect")
        self.model_pose = YOLO(os.path.join(path, "yolov8n-pose.onnx"), task="pose")

    def predict(self, frame: Any) -> Dict[str, Any]:
        if self.model_people is None: return {}
        results = self.model_people(frame, conf=0.4, verbose=False)
        count = sum(1 for box in results[0].boxes if int(box.cls[0]) == 0)
        poses = self.model_pose(frame, conf=0.4, verbose=False)
        risky = False
        if poses and poses[0].keypoints is not None:
            for kpts in poses[0].keypoints.xy:
                if len(kpts) > 10:
                    l_sh_y, r_sh_y = kpts[5][1], kpts[6][1]
                    l_wr_y, r_wr_y = kpts[9][1], kpts[10][1]
                    if l_wr_y > 0 and l_sh_y > 0 and l_wr_y < l_sh_y: risky = True
                    if r_wr_y > 0 and r_sh_y > 0 and r_wr_y < r_sh_y: risky = True
        return {"people_count": count, "pose_risk": risky, "motion_detected": False, "active": True, "timestamp": datetime.now().isoformat()}

    def process_frame(self, frame_bytes: bytes):
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is not None: self._latest_result = self.predict(frame)

    @property
    def status(self) -> Dict[str, Any]:
        return self._latest_result

vision_service = VisionEngine("app/artifacts/vision")
