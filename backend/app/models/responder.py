from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class ResponderActionLog(Base):
    __tablename__ = "responder_action_logs"

    id = Column(Integer, primary_key=True, index=True)
    responder_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("emergency_events.id"))
    action = Column(String) # acknowledge, resolve, add_note
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    responder = relationship("User")
    event = relationship("EmergencyEvent")
