#!/usr/bin/env python3
"""
Decision Engine for Women Safety System
Computes a composite Threat Score using Audio, Vision, and Context data
"""

from datetime import datetime

class ThreatDecisionEngine:
    def __init__(self):
        # Default weights (user-tunable)
        self.weights = {
            "vision": 0.5,
            "audio": 0.4,
            "context": 0.1,
        }

    def compute_risk(self, vision_status, audio_status, context_data=None):
        """
        Compute normalized risk score.
        vision_status: dict from vision_core.get_status()
        audio_status: dict from audio_core.get_status()
        context_data: dict with external info (location, time, etc.)
        """

        # ---------- Vision Risk (0–1) ----------
        vision_risk = 0.0
        if vision_status:
            # crowd (normalized up to 5 people)
            crowd_factor = min(vision_status.get("people", 0) / 5.0, 1.0)
            motion_factor = 1.0 if vision_status.get("motion") else 0.0
            pose_factor = 1.0 if vision_status.get("pose_risk") else 0.0
            vision_risk = (0.5 * crowd_factor) + (0.25 * motion_factor) + (0.25 * pose_factor)

        # ---------- Audio Risk (0–1) ----------
        audio_risk = 0.0
        if audio_status:
            emotion = audio_status.get("emotion", "").lower()
            conf = audio_status.get("confidence", 0.0)
            if emotion in ["angry", "fear"]:
                audio_risk = min(conf + 0.3, 1.0)
            else:
                audio_risk = conf * 0.4

        # ---------- Context Risk (0–1) ----------
        context_risk = 0.0
        if context_data:
            hour = context_data.get("hour", datetime.now().hour)
            location_type = context_data.get("location_type", "safe")

            # Night time = more risky
            time_factor = 0.7 if hour >= 20 or hour <= 5 else 0.2

            # Unsafe zone tag (e.g. parking_lot, isolated)
            location_factor = 0.8 if location_type in ["isolated", "unknown"] else 0.2

            context_risk = (time_factor + location_factor) / 2.0

        # ---------- Weighted Threat Score ----------
        score = (
            self.weights["vision"] * vision_risk +
            self.weights["audio"] * audio_risk +
            self.weights["context"] * context_risk
        )

        # ---------- Threat Level ----------
        if score >= 0.7:
            level = "HIGH"
        elif score >= 0.4:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "vision_risk": round(vision_risk, 2),
            "audio_risk": round(audio_risk, 2),
            "context_risk": round(context_risk, 2),
            "threat_score": round(score, 2),
            "threat_level": level,
        }


# Global instance
decision_engine = ThreatDecisionEngine()
