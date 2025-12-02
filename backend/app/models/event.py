from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float)
    longitude = Column(Float)
    risk_score = Column(Float)
    status = Column(String, default="triggered") # triggered, resolved, monitored

    user = relationship("User", back_populates="events")
    alerts = relationship("Alert", back_populates="event", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("emergency_events.id"))
    contact_name = Column(String)
    contact_phone = Column(String)
    message = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    media_path = Column(String, nullable=True) # Path to audio/video sample
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(
        Enum("sent", "acknowledged", "resolved", name="alert_status"),
        default="sent"
    )

    event = relationship("EmergencyEvent", back_populates="alerts")