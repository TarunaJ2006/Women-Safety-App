from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ResponderActionLogBase(BaseModel):
    action: str
    note: Optional[str] = None

class ResponderActionLogCreate(ResponderActionLogBase):
    event_id: int

    class Config:
        from_attributes = True

class ResponderActionLogResponse(ResponderActionLogBase):
    id: int
    responder_id: int
    responder_name: Optional[str] = None
    event_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: str
