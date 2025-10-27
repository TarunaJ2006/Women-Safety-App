import React from "react";
import { useNavigate } from "react-router-dom";
import { useSafetyData } from "../hooks/useSafetyData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { emotion, confidence, visionData, threatData, location } = useSafetyData();

  const threatLevel = threatData.threat_level || "LOW";

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
          <p>🎯 <strong>Current Status:</strong> {threatLevel === "LOW" ? "SECURE" : "ALERT"}</p>
          <p>📍 <strong>Location:</strong> {location.loading ? "Loading..." : location.error ? "Unavailable" : `${location.lat?.toFixed(4)}, ${location.lon?.toFixed(4)}`}</p>
          <p>⏰ <strong>Threat Score:</strong> {threatData.threat_score?.toFixed(2) || "0.00"}</p>
        </div>
      </div>

      {/* SYSTEMS GRID */}
      <div className="w-full max-w-3xl grid grid-cols-2 gap-4 mb-6">
        {/* Vision System */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold mb-2">📹 Vision System</h2>
          <p>People: {visionData.people_count || 0}</p>
          <p>Risk: {visionData.risk_level || "LOW"}</p>
          <p>Crowd: {visionData.is_crowded ? "Yes" : "No"}</p>
          <p>Status: {visionData.active ? "Active" : "Inactive"}</p>
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
          onClick={() => navigate("/emergency")}
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
