import React, { useState, useEffect } from "react";
import { getAudioStatus } from "../services/api";

export default function Dashboard() {
  const [emotion, setEmotion] = useState("Neutral");
  const [confidence, setConfidence] = useState(0);
  const [threatLevel, setThreatLevel] = useState("LOW");

  // Fetch backend emotion data periodically
  useEffect(() => {
    const fetchAudioStatus = async () => {
      const data = await getAudioStatus();
      setEmotion(data.emotion || "Neutral");
      setConfidence(data.confidence || 0);
    };

    fetchAudioStatus();
    const interval = setInterval(fetchAudioStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Determine threat level automatically
  useEffect(() => {
    const highRiskEmotions = ["Angry", "Fearful", "Sad"];
    if (confidence > 0.8 && highRiskEmotions.includes(emotion)) {
      setThreatLevel("HIGH");
    } else if (confidence > 0.6 && emotion !== "Neutral") {
      setThreatLevel("MEDIUM");
    } else {
      setThreatLevel("LOW");
    }
  }, [emotion, confidence]);

  // Dynamic colors + emojis
  const threatColor =
    threatLevel === "HIGH"
      ? "bg-red-600"
      : threatLevel === "MEDIUM"
      ? "bg-yellow-500"
      : "bg-green-600";

  const emotionIcon = {
    Neutral: "😐",
    Happy: "😊",
    Sad: "😢",
    Angry: "😠",
    Fearful: "😨",
    Surprised: "😲",
    Calm: "😌",
    Error: "⚠️",
  }[emotion] || "🎙️";

  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center font-sans">
      {/* HEADER */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛡️ WOMEN SAFETY APP
        </h1>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">⚙️</button>
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">👤</button>
        </div>
      </header>

      {/* STATUS CARD */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between mb-4">
          <p>🎯 <strong>Current Status:</strong> SECURE</p>
          <p>📍 <strong>Location:</strong> Downtown Mall</p>
          <p>⏰ <strong>Active Since:</strong> 14:32</p>
        </div>
      </div>

      {/* SYSTEMS GRID */}
      <div className="w-full max-w-3xl grid grid-cols-2 gap-4 mb-6">
        {/* Vision System */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold mb-2">📹 Vision System</h2>
          <p>People: 3</p>
          <p>Risk: LOW</p>
          <p>Motion: Normal</p>
          <p>Pose: Safe</p>
        </div>

        {/* Audio System */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold mb-2">🎤 Audio System</h2>
          <p>Emotion: <strong>{emotion}</strong> {emotionIcon}</p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-2 mb-1 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">Confidence: {confidencePercent}%</p>
          <p>Threat: {threatLevel}</p>
        </div>
      </div>

      {/* THREAT LEVEL */}
      <div
        className={`w-full max-w-3xl text-center p-4 rounded-xl shadow-lg ${threatColor}`}
      >
        <h3 className="text-xl font-bold">🚨 THREAT LEVEL: {threatLevel}</h3>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-6 mt-6">
        <button
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-bold shadow-md"
          onClick={() => alert("🚨 Emergency Triggered!")}
        >
          🔴 EMERGENCY
        </button>
        <button
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-lg font-bold shadow-md"
          onClick={() => alert("⚠️ Reporting Incident...")}
        >
          ⚠️ REPORT
        </button>
      </div>

      {/* FOOTER */}
      <footer className="mt-8 text-gray-500 text-sm">
        Backend: <code>http://127.0.0.1:8000/audio/status</code>
      </footer>
    </div>
  );
}
