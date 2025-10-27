// src/pages/Emergency.jsx
import React, { useEffect, useState } from "react";
import { sendEmergencySOS } from "../services/api";
import { useLocation } from "../hooks/useLocation";
import { useNavigate } from "react-router-dom";

export default function Emergency() {
  const [count, setCount] = useState(10);
  const [triggered, setTriggered] = useState(false);
  const [sosStatus, setSosStatus] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (count > 0 && !triggered) {
      const timer = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    // When countdown ends
    if (count === 0 && !triggered) handleSOS();
  }, [count, triggered]);

  // Actual SOS call
  const handleSOS = async () => {
    try {
      setTriggered(true);
      setSosStatus("Sending SOS to all emergency contacts...");
      
      const message = `🚨 EMERGENCY ALERT! Help needed immediately!`;
      const result = await sendEmergencySOS(
        null, // Backend will use contacts from database
        message,
        location.lat,
        location.lon
      );
      
      if (result.status === "sent") {
        setSosStatus(`✅ ${result.message || 'Emergency contacts notified!'}`);
      } else if (result.status === "partial") {
        setSosStatus(`⚠️ ${result.message || 'Some contacts may not have been notified'}`);
      } else {
        setSosStatus(`❌ ${result.message || 'Failed to send alerts. Please call 112 directly!'}`);
      }
    } catch (err) {
      console.error(err);
      setSosStatus("❌ Failed to send SOS. Please call 112 directly!");
    }
  };

  const handleCancel = () => {
    setTriggered(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 text-center">
      <h1 className="text-red-600 text-4xl font-bold mb-6">🚨 EMERGENCY MODE ACTIVATED</h1>
      
      {!triggered && (
        <div className="text-2xl mb-6">
          <p>Alerting emergency contacts in {count} seconds...</p>
          <div className={`text-8xl font-bold ${count <= 3 ? 'text-red-600' : 'text-orange-500'}`}>
            {count}
          </div>
        </div>
      )}
      
      {triggered && (
        <div className="mb-6">
          <p className="text-xl mb-3">{sosStatus}</p>
        </div>
      )}

      <section className="bg-gray-800 p-6 rounded-xl mb-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">📍 LOCATION SHARED</h3>
        {location.loading && <p>Loading location...</p>}
        {location.error && <p className="text-orange-500">⚠️ {location.error}</p>}
        {!location.loading && !location.error && (
          <>
            <p className="mb-2"><strong>Latitude:</strong> {location.lat?.toFixed(6) || "N/A"}</p>
            <p className="mb-2"><strong>Longitude:</strong> {location.lon?.toFixed(6) || "N/A"}</p>
            <p className="mt-4 text-sm text-gray-400">
              <a 
                href={`https://www.google.com/maps?q=${location.lat},${location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                📍 View on Google Maps
              </a>
            </p>
          </>
        )}
      </section>

      <div className="flex gap-4 justify-center flex-wrap">
        {!triggered && (
          <button 
            onClick={handleCancel}
            className="px-8 py-4 text-lg bg-gray-600 hover:bg-gray-700 border-none rounded-lg text-white cursor-pointer transition-colors"
          >
            ⏹️ Cancel
          </button>
        )}
        <button 
          onClick={() => alert("🔊 Loud alarm would trigger here!")}
          className="px-8 py-4 text-lg bg-amber-600 hover:bg-amber-700 border-none rounded-lg text-white cursor-pointer transition-colors"
        >
          🔊 Loud Alarm
        </button>
        {triggered && (
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 border-none rounded-lg text-white cursor-pointer transition-colors"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
