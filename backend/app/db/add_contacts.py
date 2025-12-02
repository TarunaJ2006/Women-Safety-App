from app.db.session import SessionLocal
from app.models.user import User
from app.models.contact import EmergencyContact

def add_contacts():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "tushar@guardia.in").first()
    if not user:
        print("User not found")
        return

    # Check if contacts already exist
    existing = db.query(EmergencyContact).filter(EmergencyContact.owner_id == user.id).first()
    if existing:
        print("Contacts already exist for this user.")
        return

    contacts = [
        {"name": "Police Control Room", "phone": "112"},
        {"name": "Women Helpline", "phone": "1091"},
        {"name": "Brother (Home)", "phone": "+919822012345"}
    ]

    for c in contacts:
        contact = EmergencyContact(
            name=c["name"],
            phone_number=c["phone"],
            owner_id=user.id,
            is_active=True
        )
        db.add(contact)
    
    db.commit()
    print(f"Added {len(contacts)} contacts for {user.email}")

if __name__ == "__main__":
    add_contacts()
