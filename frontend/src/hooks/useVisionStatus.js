import { useEffect, useState } from "react";
import { getVisionStatus } from "../services/api";

export default function useVisionStatus() {
  const [data, setData] = useState({ 
    people: 0, 
    people_count: 0, 
    risk_level: "LOW",
    motion: false,
    audio: false,
    pose_risk: false,
    active: false
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getVisionStatus();
        // Map backend response to frontend format
        const mappedData = {
          people: result.people || 0,
          people_count: result.people || 0,
          motion: result.motion || false,
          audio: result.audio || false,
          pose_risk: result.pose_risk || false,
          emotion: result.emotion || "neutral",
          confidence: result.confidence || 0,
          risk_level: result.pose_risk ? "HIGH" : result.people > 5 ? "MEDIUM" : "LOW",
          is_crowded: result.people > 5,
          active: result.people !== undefined,
          last_alert: result.last_alert
        };
        setData(mappedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching vision status:", err);
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return { ...data, error };
}
