from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class ContactBase(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    relation: Optional[str] = None
    is_active: Optional[bool] = True

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    owner_id: int
    class Config: from_attributes = True

class SettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class Setting(SettingBase):
    id: int
    owner_id: int
    class Config: from_attributes = True

class ThreatBase(BaseModel):
    source: str
    threat_level: str
    description: Optional[str] = None
    confidence: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ThreatCreate(ThreatBase):
    pass

class Threat(ThreatBase):
    id: int
    timestamp: datetime
    is_resolved: bool
    owner_id: int
    class Config: from_attributes = True