import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getAudioStatus = async () => {
  try {
    const res = await api.get("/audio/status");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching audio status:", error);
    return { emotion: "Neutral", confidence: 0 };
  }
};
