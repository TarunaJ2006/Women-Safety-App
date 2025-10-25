import React from "react";
import "../styles/settings.css";

export default function Settings() {
  return (
    <div className="settings">
      <h2>⚙️ Settings</h2>
      <section>
        <h3>📞 Emergency Contacts</h3>
        <button>➕ Add Contact</button>
      </section>

      <section>
        <h3>📍 Location Services</h3>
        <label><input type="checkbox" defaultChecked /> Share Location</label>
        <label><input type="checkbox" defaultChecked /> Geofencing</label>
      </section>

      <section>
        <h3>📢 Alert Preferences</h3>
        <label><input type="checkbox" defaultChecked /> Sound Alarm</label>
        <label><input type="checkbox" defaultChecked /> Vibrate</label>
        <label><input type="checkbox" defaultChecked /> Flash LED</label>
      </section>

      <section>
        <h3>🎯 Threat Sensitivity</h3>
        <label><input type="radio" name="sensitivity" defaultChecked /> Low</label>
        <label><input type="radio" name="sensitivity" /> Medium</label>
        <label><input type="radio" name="sensitivity" /> High</label>
      </section>

      <section>
        <h3>🛡️ Privacy</h3>
        <label><input type="checkbox" defaultChecked /> Face Blur</label>
        <label><input type="checkbox" defaultChecked /> Auto-delete Evidence (7 days)</label>
      </section>

      <div className="settings-actions">
        <button>💾 Save</button>
        <button>🔄 Reset</button>
      </div>
    </div>
  );
}
