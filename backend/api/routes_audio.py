from fastapi import APIRouter
from services import audio_core

router = APIRouter(prefix="/audio", tags=["Audio"])

@router.get("/status")
async def audio_status():
    """Return current detected emotion and confidence"""
    return audio_core.get_status()
