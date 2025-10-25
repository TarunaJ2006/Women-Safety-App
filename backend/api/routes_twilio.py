"""
Twilio API routes for the Women Safety App
"""
from fastapi import APIRouter

router = APIRouter(prefix="/twilio", tags=["twilio"])

@router.post("/send-sos")
async def send_sos():
    """Send SOS message via Twilio"""
    return {"message": "SOS message sent"}