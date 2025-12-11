from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.v1 import deps
from app.models.user import User
from app.models.event import EmergencyEvent, Alert
from app.models.responder import ResponderActionLog
from app.schemas.responder import ResponderActionLogResponse, ResponderActionLogCreate, AlertUpdate
from app.schemas.emergency import EmergencyEventResponse # Need to make sure this exists
from datetime import datetime

router = APIRouter()

def check_responder_role(current_user: User = Depends(deps.get_current_user)):
    if current_user.role not in ["responder", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.get("/events", response_model=List[EmergencyEventResponse])
def get_all_events(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(check_responder_role),
    status: str = Query(None)
):
    query = db.query(EmergencyEvent)
    if status:
        query = query.filter(EmergencyEvent.status == status)
    
    events = query.order_by(EmergencyEvent.timestamp.desc()).all()
    
    results = []
    for event in events:
        results.append({
            "id": event.id,
            "user_id": event.user_id,
            "user_name": event.user.full_name,
            "user_phone": event.user.phone_number,
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
            ]
        })
    return results

@router.post("/events/{event_id}/acknowledge")
def acknowledge_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(check_responder_role)
):
    event = db.query(EmergencyEvent).filter(EmergencyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = "acknowledged" # or keep as is but update alerts
    
    # Update all alerts for this event
    for alert in event.alerts:
        alert.status = "acknowledged"
    
    # Log action
    log = ResponderActionLog(
        responder_id=current_user.id,
        event_id=event_id,
        action="acknowledge",
        note=f"Incident acknowledged by {current_user.full_name}"
    )
    db.add(log)
    db.commit()
    return {"message": "Event acknowledged"}

@router.post("/events/{event_id}/resolve")
def resolve_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(check_responder_role)
):
    event = db.query(EmergencyEvent).filter(EmergencyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = "resolved"
    
    # Update all alerts for this event
    for alert in event.alerts:
        alert.status = "resolved"
    
    # Log action
    log = ResponderActionLog(
        responder_id=current_user.id,
        event_id=event_id,
        action="resolve",
        note=f"Incident marked as RESOLVED by {current_user.full_name}"
    )
    db.add(log)
    db.commit()
    return {"message": "Event resolved"}

@router.get("/logs", response_model=List[ResponderActionLogResponse])
def get_responder_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(check_responder_role)
):
    logs = db.query(ResponderActionLog).order_by(ResponderActionLog.timestamp.desc()).all()
    results = []
    for log in logs:
        results.append({
            "id": log.id,
            "responder_id": log.responder_id,
            "responder_name": log.responder.full_name if log.responder else "System",
            "event_id": log.event_id,
            "action": log.action,
            "note": log.note,
            "timestamp": log.timestamp
        })
    return results
