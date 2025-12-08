class RiskEngine:
    def __init__(self, w1=0.4, w2=0.4, w3=0.2, threshold=0.7):
        self.w1 = w1
        self.w2 = w2
        self.w3 = w3
        self.threshold = threshold

    def calculate_risk(self, audio_result: dict, video_result: dict) -> float:
        emotion_map = {"panic": 1.0, "fear": 0.8, "distress": 0.6, "neutral": 0.2, "calm": 0.0}
        audio_emotion_score = emotion_map.get(audio_result.get("emotion", "neutral"), 0.2) * audio_result.get("confidence", 0)
        pose_risk_score = video_result.get("pose_risk_score", 0)
        people_count = video_result.get("people_count", 0)
        crowd_density_score = min(people_count / 10.0, 1.0)
        risk_score = (self.w1 * audio_emotion_score + self.w2 * pose_risk_score + self.w3 * crowd_density_score)
        return round(risk_score, 2)

    def should_trigger_emergency(self, risk_score: float) -> bool:
        return risk_score >= self.threshold
