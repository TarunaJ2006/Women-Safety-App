from fastapi import APIRouter
from services.twilio_service import send_emergency_alert

router = APIRouter(prefix="/twilio", tags=["Twilio"])

@router.post("/alert")
async def send_alert(number: str, message: str):
    """Send an emergency alert message"""
    return send_emergency_alert(number, message)
