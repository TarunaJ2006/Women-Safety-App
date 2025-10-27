import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;

export const getAudioStatus = async () => {
  try {
    const res = await api.get("/audio/status");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching audio status:", error);
    return { emotion: "Neutral", confidence: 0 };
  }
};

export const getVisionStatus = async () => {
  try {
    const res = await api.get("/vision/status");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching vision status:", error);
    return { 
      people: 0, 
      people_count: 0, 
      risk_level: "LOW",
      motion: false,
      audio: false,
      pose_risk: false,
      active: false
    };
  }
};

export const getThreatStatus = async (latitude = null, longitude = null) => {
  try {
    const res = await api.post("/threat/status", {
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching threat status:", error);
    return {
      current_threat: {
        threat_level: "LOW",
        threat_score: 0,
      },
      recent_logs: [],
    };
  }
};

export const sendEmergencySOS = async (phoneNumber, message, latitude = null, longitude = null) => {
  try {
    const res = await api.post("/emergency/send-sos", {
      message,
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error sending SOS:", error);
    return { status: "error", message: error.message || "Failed to send emergency alert" };
  }
};

export const getEmergencyContacts = async () => {
  try {
    const res = await api.get("/emergency/contacts");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching emergency contacts:", error);
    return { contacts: [] };
  }
};

export const addEmergencyContact = async (name, phoneNumber, relationship = "", isPrimary = false) => {
  try {
    const res = await api.post("/emergency/contacts", {
      name,
      phone_number: phoneNumber,
      relationship,
      is_primary: isPrimary,
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error adding emergency contact:", error);
    return { status: "error", message: error.message };
  }
};

export const deleteEmergencyContact = async (contactId) => {
  try {
    const res = await api.delete(`/emergency/contacts/${contactId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting emergency contact:", error);
    return { status: "error", message: error.message };
  }
};

export const getSettings = async () => {
  try {
    const res = await api.get("/settings");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    return {
      auto_emergency_enabled: true,
      threat_threshold: 0.7,
      alert_cooldown_seconds: 300,
    };
  }
};

export const updateSettings = async (settings) => {
  try {
    const res = await api.post("/settings", settings);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating settings:", error);
    return { status: "error", message: error.message };
  }
};
