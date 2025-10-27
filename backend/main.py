#!/usr/bin/env python3
"""
Women Safety Backend — Full Integration with GPS + Twilio + Local Logging
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
from datetime import datetime
import uvicorn
import os
import sqlite3
from dotenv import load_dotenv

# ---------- Internal Imports ----------
from services.audio_service import audio_core
from services.vision_service import vision_core
from core.decision_engine import decision_engine
from core.database import (
    init_db, log_threat, DB_PATH,
    add_emergency_contact, get_emergency_contacts, delete_emergency_contact,
    get_setting, set_setting, log_auto_alert, get_last_auto_alert_time
)

# ---------- Twilio Integration ----------
load_dotenv()
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

twilio_enabled = all([TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE])
if twilio_enabled:
    from services.twilio_service import send_emergency_alert
    print("📱 Twilio alert system enabled.")
else:
    print("⚠️ Twilio disabled (.env missing or incomplete).")

# ---------- FASTAPI APP ----------
app = FastAPI(title="Women Safety Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- APP STARTUP ----------
@app.on_event("startup")
async def startup_event():
    print("🚀 Initializing Women Safety System...")
    init_db()
    threading.Thread(target=lambda: (time.sleep(2), audio_core.start()), daemon=True).start()
    threading.Thread(target=lambda: (time.sleep(3), vision_core.start()), daemon=True).start()

# ---------- APP SHUTDOWN ----------
@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Stopping all services...")
    audio_core.stop()
    vision_core.stop()

# ---------- ROUTES ----------
@app.get("/")
async def root():
    return {
        "status": "running",
        "services": ["audio", "vision", "decision_engine"],
        "twilio_enabled": twilio_enabled
    }

@app.get("/audio/status")
async def audio_status():
    return audio_core.get_status()

@app.get("/vision/status")
async def vision_status():
    return vision_core.get_status()

@app.post("/threat/status")
async def threat_status(request: Request):
    """Compute threat score with optional GPS data from frontend."""
    try:
        body = await request.json()
    except:
        body = {}

    lat = body.get("latitude")
    lon = body.get("longitude")

    vision = vision_core.get_status()
    audio = audio_core.get_status()
    context = {
        "hour": datetime.now().hour,
        "location_type": "safe",
        "latitude": lat,
        "longitude": lon,
    }

    result = decision_engine.compute_risk(vision, audio, context)

    # Log with GPS coordinates
    log_threat(
        vision_risk=result["vision_risk"],
        audio_risk=result["audio_risk"],
        context_risk=result["context_risk"],
        threat_score=result["threat_score"],
        threat_level=result["threat_level"],
        location=context["location_type"],
        latitude=lat,
        longitude=lon
    )

    # Auto-Emergency Alert System
    auto_emergency_enabled = get_setting("auto_emergency_enabled", "true") == "true"
    threat_threshold = float(get_setting("threat_threshold", "0.7"))
    alert_cooldown = int(get_setting("alert_cooldown_seconds", "300"))
    
    auto_alert_sent = False
    if auto_emergency_enabled and result["threat_level"] == "HIGH" and result["threat_score"] >= threat_threshold:
        # Check cooldown period
        last_alert_time = get_last_auto_alert_time()
        can_send_alert = True
        
        if last_alert_time:
            time_diff = (datetime.now() - last_alert_time).total_seconds()
            can_send_alert = time_diff >= alert_cooldown
        
        if can_send_alert and twilio_enabled:
            contacts = get_emergency_contacts()
            if contacts:
                alert_msg = (
                    f"🚨 AUTO EMERGENCY ALERT 🚨\n"
                    f"HIGH THREAT DETECTED\n"
                    f"Score: {result['threat_score']:.2f}\n"
                    f"Time: {datetime.now().strftime('%H:%M:%S')}\n"
                )
                if lat and lon:
                    alert_msg += f"📍 Location: https://www.google.com/maps?q={lat},{lon}"
                
                notified_contacts = []
                for contact in contacts:
                    try:
                        send_emergency_alert(contact["phone_number"], alert_msg)
                        notified_contacts.append(contact["name"])
                    except Exception as e:
                        print(f"Failed to notify {contact['name']}: {e}")
                
                if notified_contacts:
                    log_auto_alert(
                        threat_level=result["threat_level"],
                        threat_score=result["threat_score"],
                        contacts_notified=", ".join(notified_contacts),
                        latitude=lat,
                        longitude=lon,
                        status="sent"
                    )
                    auto_alert_sent = True
                    print(f"📱 Auto-emergency alert sent to: {', '.join(notified_contacts)}")

    # Recent history (for dashboard)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT timestamp, threat_level, threat_score, latitude, longitude "
        "FROM threat_logs ORDER BY id DESC LIMIT 5;"
    )
    logs = cursor.fetchall()
    conn.close()

    history = [
        {"timestamp": t, "level": lvl, "score": s, "lat": la, "lon": lo}
        for (t, lvl, s, la, lo) in logs
    ]

    return {
        "current_threat": result,
        "gps": {"latitude": lat, "longitude": lon},
        "recent_logs": history,
        "auto_alert_sent": auto_alert_sent,
        "auto_emergency_enabled": auto_emergency_enabled
    }        

@app.post("/twilio/test")
async def twilio_test(request: Request):
    """Manual test SMS route."""
    if not twilio_enabled:
        return {"status": "error", "message": "Twilio not configured (.env missing)"}
    
    try:
        body = await request.json()
        number = body.get("phone_number")
        if not number:
            return {"status": "error", "message": "phone_number is required"}
    except:
        return {"status": "error", "message": "Invalid request body. Provide {\"phone_number\": \"+1234567890\"}"}

    msg = f"✅ Twilio test from Women Safety Backend — {datetime.now().strftime('%H:%M:%S')}"
    result = send_emergency_alert(number, msg)
    return result

@app.post("/emergency/send-sos")
async def emergency_send_sos(request: Request):
    """Send emergency SOS with location data to all emergency contacts."""
    if not twilio_enabled:
        return {"status": "error", "message": "Twilio not configured (.env missing)"}
    
    try:
        body = await request.json()
    except:
        return {"status": "error", "message": "Invalid request body"}
    
    # Get emergency contacts from database
    contacts = get_emergency_contacts()
    if not contacts:
        return {"status": "error", "message": "No emergency contacts configured. Please add contacts in Settings."}
    
    message = body.get("message", "🚨 EMERGENCY ALERT!")
    latitude = body.get("latitude")
    longitude = body.get("longitude")
    
    # Enhance message with GPS coordinates
    if latitude and longitude:
        enhanced_message = f"{message}\n\n📍 GPS Location: https://www.google.com/maps?q={latitude},{longitude}"
    else:
        enhanced_message = message
    
    # Send to all emergency contacts
    results = []
    for contact in contacts:
        try:
            result = send_emergency_alert(contact["phone_number"], enhanced_message)
            results.append({"name": contact["name"], "status": result["status"]})
        except Exception as e:
            results.append({"name": contact["name"], "status": "error", "error": str(e)})
    
    # Log the emergency event
    log_threat(
        vision_risk=0.8,
        audio_risk=0.8,
        context_risk=0.9,
        threat_score=0.9,
        threat_level="EMERGENCY",
        location="Emergency SOS Triggered",
        latitude=latitude,
        longitude=longitude
    )
    
    # Check if all sent successfully
    all_sent = all(r["status"] == "sent" for r in results)
    return {
        "status": "sent" if all_sent else "partial",
        "message": f"Emergency alert sent to {len([r for r in results if r['status'] == 'sent'])} of {len(contacts)} contacts",
        "contacts_notified": results
    }

# ---------- EMERGENCY CONTACTS ENDPOINTS ----------
@app.get("/emergency/contacts")
async def get_contacts():
    """Get all emergency contacts."""
    contacts = get_emergency_contacts()
    return {"contacts": contacts}

@app.post("/emergency/contacts")
async def add_contact(request: Request):
    """Add a new emergency contact."""
    try:
        body = await request.json()
    except:
        return {"status": "error", "message": "Invalid request body"}
    
    name = body.get("name")
    phone_number = body.get("phone_number")
    relationship = body.get("relationship", "")
    is_primary = body.get("is_primary", False)
    
    if not name or not phone_number:
        return {"status": "error", "message": "Name and phone number are required"}
    
    contact_id = add_emergency_contact(name, phone_number, relationship, is_primary)
    return {"status": "success", "contact_id": contact_id, "message": "Contact added successfully"}

@app.delete("/emergency/contacts/{contact_id}")
async def remove_contact(contact_id: int):
    """Delete an emergency contact."""
    try:
        delete_emergency_contact(contact_id)
        return {"status": "success", "message": "Contact deleted successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ---------- SETTINGS ENDPOINTS ----------
@app.get("/settings")
async def get_settings():
    """Get all settings."""
    return {
        "auto_emergency_enabled": get_setting("auto_emergency_enabled", "true") == "true",
        "threat_threshold": float(get_setting("threat_threshold", "0.7")),
        "alert_cooldown_seconds": int(get_setting("alert_cooldown_seconds", "300"))
    }

@app.post("/settings")
async def update_settings(request: Request):
    """Update settings."""
    try:
        body = await request.json()
    except:
        return {"status": "error", "message": "Invalid request body"}
    
    if "auto_emergency_enabled" in body:
        set_setting("auto_emergency_enabled", "true" if body["auto_emergency_enabled"] else "false")
    
    if "threat_threshold" in body:
        set_setting("threat_threshold", str(body["threat_threshold"]))
    
    if "alert_cooldown_seconds" in body:
        set_setting("alert_cooldown_seconds", str(body["alert_cooldown_seconds"]))
    
    return {"status": "success", "message": "Settings updated successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
