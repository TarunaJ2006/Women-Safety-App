import React from "react";

export default function SystemPanel() {
  return (
    <div className="system-panel">
      <div>
        <h4>📹 VISION SYSTEM</h4>
        <p>People: 3</p>
        <p>Risk: LOW</p>
        <p>Motion: Normal</p>
        <p>Pose: Safe</p>
      </div>
      <div>
        <h4>🎤 AUDIO SYSTEM</h4>
        <p>Emotion: Calm</p>
        <p>Confidence: 87%</p>
        <p>Threat: NONE</p>
      </div>
    </div>
  );
}
