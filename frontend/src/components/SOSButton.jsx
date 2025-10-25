// src/components/SOSButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function SOSButton({ label, danger }) {
  const nav = useNavigate();

  const handleClick = () => {
    if (label.includes("EMERGENCY")) {
      // Navigate to emergency screen
      nav("/emergency");
    } else {
      alert("Report feature coming soon!");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: danger ? "red" : "#facc15",
        color: "white",
        margin: "5px",
        fontSize: "16px",
      }}
    >
      {label}
    </button>
  );
}
