import { useEffect, useState } from "react";
import { getAudioStatus } from "../services/api";

export default function useAudioStatus() {
  const [data, setData] = useState({ emotion: "Neutral", confidence: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAudioStatus();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching audio status:", err);
        setError(err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return { ...data, error };
}
