from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum("user", "responder", "admin", name="user_roles"),
        default="user"
    )
    is_active = Column(Boolean(), default=True)
    
    contacts = relationship("EmergencyContact", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("SystemSetting", back_populates="owner", cascade="all, delete-orphan")
    threat_logs = relationship("ThreatLog", back_populates="owner", cascade="all, delete-orphan")
    events = relationship("EmergencyEvent", back_populates="user", cascade="all, delete-orphan")