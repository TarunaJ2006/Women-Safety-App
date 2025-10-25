import { useState, useEffect } from "react";
import { getAudioStatus } from "../services/api";

export const useSafetyData = () => {
  const [emotion, setEmotion] = useState("Neutral");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAudioStatus();
      setEmotion(data.emotion || "Neutral");
      setConfidence(data.confidence || 0);
    };

    // Initial fetch
    fetchData();

    // Poll every 2 seconds
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return { emotion, confidence };
};
