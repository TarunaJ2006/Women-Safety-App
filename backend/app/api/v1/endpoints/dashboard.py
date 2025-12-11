from fastapi import APIRouter, Depends, UploadFile, File
from app.api.v1 import deps
from app.ai.vision.engine import vision_service
from app.ai.audio.engine import audio_service
from app.services.decision import decision_engine
from app.models.user import User

router = APIRouter()

def startup_ai_services():
    print("🤖 AI Services: Loading Models...")
    vision_service.load_model()
    audio_service.load_model()
    print("✅ AI Models Loaded (Passive Mode)")

def shutdown_ai_services(): pass

@router.get("/status")
def get_system_status(current_user: User = Depends(deps.get_current_user)):
    v_stat = vision_service.status
    a_stat = audio_service.status
    risk = decision_engine.compute_risk(v_stat, a_stat)
    return {
        "vision": v_stat, 
        "audio": a_stat, 
        "risk": risk, 
        "system": {
            "vision_active": v_stat["active"], 
            "audio_active": a_stat["active"],
            "audio_ready": audio_service.session is not None,
            "vision_ready": vision_service.model_people is not None
        }
    }

@router.post("/ingest/vision")
async def ingest_vision(file: UploadFile = File(...), current_user: User = Depends(deps.get_current_user)):
    try:
        contents = await file.read()
        vision_service.process_frame(contents)
        return {"status": "ok"}
    except Exception as e: return {"status": "error", "detail": str(e)}

@router.post("/ingest/audio")
async def ingest_audio(file: UploadFile = File(...), current_user: User = Depends(deps.get_current_user)):
    try:
        contents = await file.read()
        audio_service.process_audio(contents)
        return {"status": "ok"}
    except Exception as e: return {"status": "error", "detail": str(e)}
