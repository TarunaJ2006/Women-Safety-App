from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
from datetime import datetime
import uvicorn

from services.audio_service import audio_core
from services.vision_service import vision_core
from core.decision_engine import decision_engine

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
    print("🎧 Starting audio & vision services...")
    threading.Thread(target=lambda: (time.sleep(2), audio_core.start()), daemon=True).start()
    threading.Thread(target=lambda: (time.sleep(3), vision_core.start()), daemon=True).start()

# ---------- APP SHUTDOWN ----------
@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Stopping services...")
    audio_core.stop()
    vision_core.stop()

# ---------- ROUTES ----------
@app.get("/")
async def root():
    return {"status": "running", "services": ["audio", "vision", "decision_engine"]}

@app.get("/audio/status")
async def audio_status():
    return audio_core.get_status()

@app.get("/vision/status")
async def vision_status():
    return vision_core.get_status()

@app.get("/threat/status")
async def threat_status():
    vision = vision_core.get_status()
    audio = audio_core.get_status()
    context = {"hour": datetime.now().hour, "location_type": "safe"}

    result = decision_engine.compute_risk(vision, audio, context)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
