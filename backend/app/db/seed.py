from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine

def seed_db():
    db = SessionLocal()
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have users
    if db.query(User).first():
        print("Database already seeded.")
        return

    users = [
        {
            "full_name": "System Admin",
            "email": "admin@example.com",
            "password": "adminpassword",
            "role": "admin",
            "phone_number": "1234567890"
        },
        {
            "full_name": "Emergency Responder",
            "email": "responder@example.com",
            "password": "responderpassword",
            "role": "responder",
            "phone_number": "0987654321"
        },
        {
            "full_name": "Regular User",
            "email": "user@example.com",
            "password": "userpassword",
            "role": "user",
            "phone_number": "5555555555"
        }
    ]

    for user_data in users:
        user = User(
            full_name=user_data["full_name"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            role=user_data["role"],
            phone_number=user_data["phone_number"],
            is_active=True
        )
        db.add(user)
    
    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
