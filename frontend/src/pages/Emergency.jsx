// src/pages/Emergency.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/emergency.css";

export default function Emergency() {
  const [count, setCount] = useState(10);
  const [triggered, setTriggered] = useState(false);

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
      await api.post("/send-sos/", {
        to: "+911234567890",
        body: "🚨 SOS! Emergency detected. Please help immediately!",
      });
      alert("SOS sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send SOS!");
    }
  };

  return (
    <div className="emergency">
      <h1>🚨 EMERGENCY MODE ACTIVATED</h1>
      {!triggered && <p>Calling 112 in {count} seconds...</p>}
      {triggered && <p>📞 Contacts have been notified.</p>}

      <section>
        <h3>📍 LOCATION SHARED</h3>
        <p>Latitude: 40.7128</p>
        <p>Longitude: -74.0060</p>
      </section>

      <div className="buttons">
        {!triggered && <button onClick={() => setTriggered(true)}>⏹️ Cancel</button>}
        <button onClick={() => alert("Loud alarm triggered!")}>🔊 Loud Alarm</button>
      </div>
    </div>
  );
}
