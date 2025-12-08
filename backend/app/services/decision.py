from datetime import datetime

class ThreatDecisionEngine:
    def __init__(self):
        self.weights = {"vision": 0.5, "audio": 0.4, "context": 0.1}

    def compute_risk(self, vision_status, audio_status, context_data=None):
        vision_risk = 0.0
        if vision_status:
            crowd_factor = min(vision_status.get("people_count", 0) / 5.0, 1.0)
            motion_factor = 1.0 if vision_status.get("motion_detected") else 0.0
            pose_factor = 1.0 if vision_status.get("pose_risk") else 0.0
            vision_risk = (0.5 * crowd_factor) + (0.25 * motion_factor) + (0.25 * pose_factor)

        audio_risk = 0.0
        if audio_status:
            emotion = audio_status.get("emotion", "").lower()
            conf = audio_status.get("confidence", 0.0)
            if emotion in ["angry", "fearful"]: audio_risk = min(conf + 0.3, 1.0)
            else: audio_risk = conf * 0.4

        context_risk = 0.0 # Context logic can be expanded
        score = self.weights["vision"] * vision_risk + self.weights["audio"] * audio_risk + self.weights["context"] * context_risk
        level = "HIGH" if score >= 0.7 else "MEDIUM" if score >= 0.4 else "LOW"
        return {"vision_risk": round(vision_risk, 2), "audio_risk": round(audio_risk, 2), "context_risk": round(context_risk, 2), "threat_score": round(score, 2), "threat_level": level}

decision_engine = ThreatDecisionEngine()
