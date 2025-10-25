import React from "react";

export default function StatusCard({ status, location, time }) {
  return (
    <div className="status-card">
      <p>🎯 CURRENT STATUS: <strong>{status}</strong></p>
      <p>📍 Location: {location}</p>
      <p>⏰ Active Since: {time}</p>
    </div>
  );
}
