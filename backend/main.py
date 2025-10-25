#!/usr/bin/env python3
"""
Women Safety Backend — Full Integration
Handles:
- Audio & Vision risk data
- Decision Engine
- Local SQLite logging
- Twilio SMS alerts
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
from datetime import datetime
import uvicorn
import os
import sqlite3

# ---------- Internal Imports ----------
from services.audio_service import audio_core
from services.vision_service import vision_core
from core.decision_engine import decision_engine
from core.database import init_db, log_threat, DB_PATH

# ---------- Twilio Integration ----------
from dotenv import load_dotenv
load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

twilio_enabled = all([TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE])
if twilio_enabled:
    from services.twilio_service import send_emergency_alert
    print("📱 Twilio alert system enabled.")
else:
    print("⚠️ Twilio disabled (missing .env credentials).")

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
    print("🚀 Women Safety System initializing...")
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


@app.get("/threat/status")
async def threat_status():
    """Compute risk → log locally → send Twilio alert if HIGH → return history"""
    vision = vision_core.get_status()
    audio = audio_core.get_status()
    context = {"hour": datetime.now().hour, "location_type": "safe"}

    result = decision_engine.compute_risk(vision, audio, context)

    # Log locally
    log_threat(
        vision_risk=result["vision_risk"],
        audio_risk=result["audio_risk"],
        context_risk=result["context_risk"],
        threat_score=result["threat_score"],
        threat_level=result["threat_level"],
        location=context["location_type"]
    )

    # Send Twilio alert if HIGH
    if result["threat_level"] == "HIGH" and twilio_enabled:
        alert_msg = (
            f"⚠️ HIGH THREAT DETECTED ⚠️\n"
            f"Score: {result['threat_score']} | Time: {datetime.now().strftime('%H:%M:%S')}"
        )
        send_emergency_alert("+91XXXXXXXXXX", alert_msg)

    # Fetch recent 5 logs
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, threat_level, threat_score FROM threat_logs ORDER BY id DESC LIMIT 5;")
    logs = cursor.fetchall()
    conn.close()

    history = [
        {"timestamp": t, "level": lvl, "score": s}
        for (t, lvl, s) in logs
    ]

    return {
        "current_threat": result,
        "recent_logs": history
    }


@app.post("/twilio/test")
async def twilio_test(number: str = "+91XXXXXXXXXX"):
    """Send a test SMS via Twilio (for debugging)"""
    if not twilio_enabled:
        return {"status": "error", "message": "Twilio not configured (.env missing)"}

    test_msg = f"✅ Twilio test from Women Safety Backend — {datetime.now().strftime('%H:%M:%S')}"
    result = send_emergency_alert(number, test_msg)
    return result


# ---------- MAIN ----------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
