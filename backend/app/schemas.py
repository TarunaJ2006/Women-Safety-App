from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    name: str
    phone_number: str
    relation: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    contact_name: str
    contact_phone: str
    message: str
    sent_at: datetime

    class Config:
        from_attributes = True

# Emergency Schemas
class EmergencyEventBase(BaseModel):
    latitude: float
    longitude: float
    risk_score: float

class EmergencyEventCreate(EmergencyEventBase):
    pass

class EmergencyEventResponse(EmergencyEventBase):
    id: int
    timestamp: datetime
    status: str
    alerts: List[AlertResponse] = []

    class Config:
        from_attributes = True
