import React from "react";

export default function ThreatIndicator({ level }) {
  const color = level === "HIGH" ? "red" : level === "MEDIUM" ? "orange" : "green";
  return (
    <div className="threat-indicator" style={{ borderLeft: `6px solid ${color}`, padding: "10px", margin: "10px 0" }}>
      🚨 THREAT LEVEL: <strong style={{ color }}>{level}</strong>
    </div>
  );
}
