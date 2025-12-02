from sqlalchemy import Column, Integer, String, Float, DateTime, func, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)
    threat_level = Column(String)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=func.now())
    is_resolved = Column(Boolean, default=False, nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="threat_logs")
