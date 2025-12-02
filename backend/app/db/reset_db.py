from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_and_seed():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Seed users
    users = [
        {
            "full_name": "Tushar",
            "email": "tushar@guardia.in",
            "password": "password123",
            "role": "responder",
            "phone_number": "+910000000000"
        },
        {
            "full_name": "Priya Sharma",
            "email": "test@example.com",
            "password": "password123",
            "role": "user",
            "phone_number": "+919988776655"
        },
        {
            "full_name": "Rajesh Kumar",
            "email": "admin@example.com",
            "password": "adminpassword",
            "role": "admin",
            "phone_number": "+919000011111"
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
    print("Database reset and seeded successfully.")

if __name__ == "__main__":
    reset_and_seed()
