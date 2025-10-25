import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const nav = useNavigate();
  return (
    <div className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h2>🛡️ WOMEN SAFETY APP</h2>
      <div>
        <button onClick={() => nav("/settings")}>⚙️</button>
        <button>👤</button>
      </div>
    </div>
  );
}
