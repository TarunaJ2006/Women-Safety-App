from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AlertResponse(BaseModel):
    id: int
    contact_name: str
    contact_phone: str
    status: str
    sent_at: datetime

    class Config:
        from_attributes = True

from app.schemas.responder import ResponderActionLogResponse

class EmergencyEventResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    latitude: float
    longitude: float
    risk_score: float
    status: str
    timestamp: datetime
    alerts: List[AlertResponse] = []
    action_logs: List[ResponderActionLogResponse] = []

    class Config:
        from_attributes = True
