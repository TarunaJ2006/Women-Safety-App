from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
from app.api.v1 import deps
from app.models.user import User
from app.models.event import EmergencyEvent, Alert
from app.models.responder import ResponderActionLog
from app.models.contact import EmergencyContact
from app.schemas.threat import Threat, ThreatCreate
from app.schemas.user import User as UserResponse
from app.ai.audio.engine import audio_service
from app.ai.vision.engine import vision_service
from app.services.decision import decision_engine
from datetime import datetime
from pydantic import BaseModel

import logging
router = APIRouter()
logger = logging.getLogger(__name__)

from app.schemas.emergency import EmergencyEventResponse, AlertResponse

from app.schemas.emergency import EmergencyEventResponse, AlertResponse



@router.post("/sos", response_model=EmergencyEventResponse)

async def trigger_sos(
    latitude: float = Form(...), 
    longitude: float = Form(...), 
    db: Session = Depends(deps.get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    logger.info(f"🚨 SOS RECEIVED from {current_user.full_name} (ID: {current_user.id})")
    logger.info(f"📍 Location: {latitude}, {longitude}")
    
    event = EmergencyEvent(
        user_id=current_user.id, 
        latitude=latitude, 
        longitude=longitude, 
        risk_score=1.0,
        status="triggered"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    logger.info(f"✅ Event created with ID: {event.id}")

    # Log to responder action logs
    log = ResponderActionLog(
        responder_id=current_user.id,
        event_id=event.id,
        action="sos_triggered",
        note=f"SOS triggered by {current_user.full_name}"
    )
    db.add(log)
    db.commit()
    logger.info(f"📝 Action log created for event {event.id}")

    await simulate_alerts(db, current_user, event)
    return event

@router.post("/ml-inference", response_model=EmergencyEventResponse)
async def ml_inference(
    latitude: float = Form(...), 
    longitude: float = Form(...), 
    audio: Optional[UploadFile] = File(None), 
    video: Optional[UploadFile] = File(None), 
    db: Session = Depends(deps.get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    if audio:
        audio_content = await audio.read()
        audio_service.process_audio(audio_content)
    
    if video:
        video_content = await video.read()
        vision_service.process_frame(video_content)
    
    v_stat = vision_service.status
    a_stat = audio_service.status
    risk_data = decision_engine.compute_risk(v_stat, a_stat)
    risk_score = risk_data["threat_score"]
    
    event = EmergencyEvent(
        user_id=current_user.id, 
        latitude=latitude, 
        longitude=longitude, 
        risk_score=risk_score,
        status="triggered" if risk_score >= 0.7 else "monitored"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    if event.status == "triggered":
        # Log to responder action logs
        log = ResponderActionLog(
            responder_id=current_user.id,
            event_id=event.id,
            action="ai_threat_detected",
            note=f"AI detected threat (Score: {risk_score:.2f}) for {current_user.full_name}"
        )
        db.add(log)
        db.commit()
        await simulate_alerts(db, current_user, event)
        
    return event

@router.get("/history", response_model=List[EmergencyEventResponse])
def get_history(
    db: Session = Depends(deps.get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    events = db.query(EmergencyEvent).filter(EmergencyEvent.user_id == current_user.id).order_by(EmergencyEvent.timestamp.desc()).all()
    results = []
    for event in events:
        results.append({
            "id": event.id,
            "user_id": event.user_id,
            "user_name": event.user.full_name,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "risk_score": event.risk_score,
            "status": event.status,
            "timestamp": event.timestamp,
            "alerts": [
                {
                    "id": a.id,
                    "contact_name": a.contact_name,
                    "contact_phone": a.contact_phone,
                    "status": a.status,
                    "sent_at": a.sent_at
                } for a in event.alerts
            ],
            "action_logs": [
                {
                    "id": log.id,
                    "responder_id": log.responder_id,
                    "responder_name": log.responder.full_name if log.responder else "System",
                    "event_id": log.event_id,
                    "action": log.action,
                    "note": log.note,
                    "timestamp": log.timestamp
                } for log in db.query(ResponderActionLog).filter(ResponderActionLog.event_id == event.id).all()
            ]
        })
    return results

@router.get("/received")
def get_received_alerts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if not current_user.phone_number:
        return []
    
    # Find alerts sent to current user's phone number
    alerts = db.query(Alert).filter(Alert.contact_phone == current_user.phone_number).all()
    
    # Group by event and include user info
    results = []
    for alert in alerts:
        event = db.query(EmergencyEvent).filter(EmergencyEvent.id == alert.event_id).first()
        victim = db.query(User).filter(User.id == event.user_id).first()
        results.append({
            "alert_id": alert.id,
            "message": alert.message,
            "timestamp": alert.sent_at,
            "victim_name": victim.full_name,
            "victim_phone": victim.phone_number,
            "latitude": alert.latitude or event.latitude,
            "longitude": alert.longitude or event.longitude,
            "risk_score": event.risk_score,
            "status": event.status,
            "media_path": getattr(alert, 'media_path', None)
        })
    return sorted(results, key=lambda x: x["timestamp"], reverse=True)

async def simulate_alerts(db: Session, user: User, event: EmergencyEvent):

    contacts = db.query(EmergencyContact).filter(EmergencyContact.owner_id == user.id, EmergencyContact.is_active == True).all()

    for contact in contacts:

        message = f"EMERGENCY ALERT! {user.full_name} is in danger. Location: https://www.google.com/maps?q={event.latitude},{event.longitude}. Risk Score: {event.risk_score}"

        alert = Alert(

            event_id=event.id, 

            contact_name=contact.name, 

            contact_phone=contact.phone_number, 

            message=message,

            latitude=event.latitude,

            longitude=event.longitude,

            status="sent"

        )

        db.add(alert)

        logger.info(f"📤 [SIMULATED ALERT] To: {contact.name} ({contact.phone_number})")

    db.commit()
