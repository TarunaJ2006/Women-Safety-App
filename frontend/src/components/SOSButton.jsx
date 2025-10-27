// src/components/SOSButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './SOSButton.css';

export default function SOSButton({ label = "SOS", danger = true, onActivate }) {
  const nav = useNavigate();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(true);
    
    if (label.includes("EMERGENCY") || label.includes("SOS")) {
      // Trigger SOS
      if (onActivate) {
        onActivate();
      }
      // Navigate to emergency screen
      setTimeout(() => {
        nav("/emergency");
      }, 300);
    } else {
      setTimeout(() => setIsActive(false), 2000);
    }
  };

  return (
    <div className="sos-button-container">
      <button
        onClick={handleClick}
        className={`sos-button ${isActive ? 'active' : ''}`}
        aria-label="Emergency SOS Button"
      >
        {isActive && (
          <>
            <div className="sos-ripple"></div>
            <div className="sos-ripple"></div>
            <div className="sos-ripple"></div>
          </>
        )}
        <span className="sos-button-text">{label}</span>
        <span className="sos-button-subtext">Press for Help</span>
      </button>
    </div>
  );
}
