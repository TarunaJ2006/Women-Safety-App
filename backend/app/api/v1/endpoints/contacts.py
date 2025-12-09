from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.v1 import deps
from app.models.contact import EmergencyContact
from app.models.user import User
from app.schemas.threat import Contact, ContactCreate

router = APIRouter()

@router.get("/", response_model=List[Contact])
def read_contacts(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return db.query(EmergencyContact).filter(EmergencyContact.owner_id == current_user.id).all()

@router.post("/", response_model=Contact)
def create_contact(contact_in: ContactCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    db_contact = EmergencyContact(**contact_in.model_dump(), owner_id=current_user.id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id, EmergencyContact.owner_id == current_user.id).first()
    if not contact: raise HTTPException(status_code=404, detail="Not found")
    db.delete(contact)
    db.commit()
    return {"ok": True}