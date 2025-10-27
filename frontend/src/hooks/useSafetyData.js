import { useState, useEffect } from "react";
import { getAudioStatus, getVisionStatus, getThreatStatus } from "../services/api";
import { useLocation } from "./useLocation";

export const useSafetyData = () => {
  const [emotion, setEmotion] = useState("Neutral");
  const [confidence, setConfidence] = useState(0);
  const [visionData, setVisionData] = useState({ 
    people: 0, 
    motion: false, 
    audio: false, 
    pose_risk: false,
    active: false,
    risk_level: "LOW"
  });
  const [threatData, setThreatData] = useState({
    threat_level: "LOW",
    threat_score: 0,
    recent_logs: [],
  });
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch audio status
      const audioData = await getAudioStatus();
      setEmotion(audioData.emotion || "Neutral");
      setConfidence(audioData.confidence || 0);

      // Fetch vision status
      const vision = await getVisionStatus();
      // Map backend response to frontend format
      const mappedVision = {
        people: vision.people || 0,
        people_count: vision.people || 0,
        motion: vision.motion || false,
        audio: vision.audio || false,
        pose_risk: vision.pose_risk || false,
        emotion: vision.emotion || "neutral",
        confidence: vision.confidence || 0,
        risk_level: vision.pose_risk ? "HIGH" : vision.people > 5 ? "MEDIUM" : "LOW",
        is_crowded: vision.people > 5,
        active: vision.people !== undefined,
        last_alert: vision.last_alert
      };
      setVisionData(mappedVision);

      // Fetch threat status with GPS coordinates
      const threat = await getThreatStatus(
        location.lat,
        location.lon
      );
      if (threat.current_threat) {
        setThreatData({
          threat_level: threat.current_threat.threat_level,
          threat_score: threat.current_threat.threat_score,
          recent_logs: threat.recent_logs || [],
        });
      }
    };

    // Initial fetch
    if (!location.loading) {
      fetchData();
    }

    // Poll every 2 seconds
    const interval = setInterval(() => {
      if (!location.loading) {
        fetchData();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [location.lat, location.lon, location.loading]);

  return { emotion, confidence, visionData, threatData, location };
};
