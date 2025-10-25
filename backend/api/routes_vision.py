from fastapi import APIRouter, HTTPException
from services.vision_service import vision_core

router = APIRouter(prefix="/vision", tags=["Vision"])

@router.get("/status")
async def get_vision_status():
    try:
        status = vision_core.get_status()
        return status
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
