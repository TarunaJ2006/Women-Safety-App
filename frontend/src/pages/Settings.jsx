import React, { useState, useEffect } from "react";
import { 
  getEmergencyContacts, 
  addEmergencyContact, 
  deleteEmergencyContact,
  getSettings,
  updateSettings 
} from "../services/api";
import "../styles/settings.css";

export default function Settings() {
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState({
    auto_emergency_enabled: true,
    threat_threshold: 0.7,
    alert_cooldown_seconds: 300,
  });
  const [newContact, setNewContact] = useState({
    name: "",
    phone_number: "",
    relationship: "",
    is_primary: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    loadContacts();
    loadSettings();
  }, []);

  const loadContacts = async () => {
    const response = await getEmergencyContacts();
    setContacts(response.contacts || []);
  };

  const loadSettings = async () => {
    const response = await getSettings();
    setSettings(response);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone_number) {
      setStatusMessage("⚠️ Name and phone number are required");
      return;
    }

    const result = await addEmergencyContact(
      newContact.name,
      newContact.phone_number,
      newContact.relationship,
      newContact.is_primary
    );

    if (result.status === "success") {
      setStatusMessage("✅ Contact added successfully!");
      setNewContact({ name: "", phone_number: "", relationship: "", is_primary: false });
      setShowAddForm(false);
      loadContacts();
      setTimeout(() => setStatusMessage(""), 3000);
    } else {
      setStatusMessage(`❌ Error: ${result.message}`);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const result = await deleteEmergencyContact(contactId);
      if (result.status === "success") {
        setStatusMessage("✅ Contact deleted successfully!");
        loadContacts();
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage(`❌ Error: ${result.message}`);
      }
    }
  };

  const handleSaveSettings = async () => {
    const result = await updateSettings(settings);
    if (result.status === "success") {
      setStatusMessage("✅ Settings saved successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } else {
      setStatusMessage(`❌ Error: ${result.message}`);
    }
  };

  return (
    <div className="settings">
      <h2>⚙️ Settings</h2>
      
      {statusMessage && (
        <div className="status-message" style={{ 
          padding: "10px", 
          marginBottom: "15px", 
          borderRadius: "5px",
          backgroundColor: statusMessage.includes("✅") ? "#10b981" : "#ef4444",
          color: "white"
        }}>
          {statusMessage}
        </div>
      )}

      <section>
        <h3>📞 Emergency Contacts ({contacts.length})</h3>
        <div style={{ marginBottom: "15px" }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ 
              backgroundColor: "#2a2a2a", 
              padding: "10px", 
              marginBottom: "10px", 
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <strong>{contact.name}</strong>
                {contact.is_primary && <span style={{ color: "#fbbf24", marginLeft: "5px" }}>⭐ Primary</span>}
                <br />
                <span style={{ color: "#9ca3af" }}>{contact.phone_number}</span>
                {contact.relationship && (
                  <span style={{ color: "#9ca3af" }}> • {contact.relationship}</span>
                )}
              </div>
              <button 
                onClick={() => handleDeleteContact(contact.id)}
                style={{ 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  border: "none", 
                  padding: "5px 10px", 
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
        
        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)}>➕ Add Contact</button>
        ) : (
          <form onSubmit={handleAddContact} style={{ backgroundColor: "#2a2a2a", padding: "15px", borderRadius: "5px" }}>
            <input
              type="text"
              placeholder="Name *"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={newContact.phone_number}
              onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
            />
            <input
              type="text"
              placeholder="Relationship (optional)"
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "5px", border: "1px solid #444" }}
            />
            <label style={{ display: "block", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={newContact.is_primary}
                onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })}
              />
              {" "}Set as Primary Contact
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={{ flex: 1 }}>✅ Add</button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, backgroundColor: "#6b7280" }}>❌ Cancel</button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h3>🚨 Auto-Emergency Alerts</h3>
        <label>
          <input 
            type="checkbox" 
            checked={settings.auto_emergency_enabled}
            onChange={(e) => setSettings({ ...settings, auto_emergency_enabled: e.target.checked })}
          /> 
          Enable Automatic Emergency Alerts
        </label>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "5px" }}>
          Automatically alert emergency contacts when HIGH threat is detected
        </p>
        
        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Threat Score Threshold: {settings.threat_threshold}</label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={settings.threat_threshold}
            onChange={(e) => setSettings({ ...settings, threat_threshold: parseFloat(e.target.value) })}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
            <span>0.5 (Sensitive)</span>
            <span>1.0 (Critical Only)</span>
          </div>
        </div>
        
        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Alert Cooldown: {settings.alert_cooldown_seconds}s</label>
          <input
            type="range"
            min="60"
            max="600"
            step="30"
            value={settings.alert_cooldown_seconds}
            onChange={(e) => setSettings({ ...settings, alert_cooldown_seconds: parseInt(e.target.value) })}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
            <span>60s</span>
            <span>600s (10 min)</span>
          </div>
        </div>
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
        <h3>🛡️ Privacy</h3>
        <label><input type="checkbox" defaultChecked /> Face Blur</label>
        <label><input type="checkbox" defaultChecked /> Auto-delete Evidence (7 days)</label>
      </section>

      <div className="settings-actions">
        <button onClick={handleSaveSettings}>💾 Save Settings</button>
        <button onClick={() => { loadSettings(); setStatusMessage("🔄 Settings reset"); }}>🔄 Reset</button>
      </div>
    </div>
  );
}
