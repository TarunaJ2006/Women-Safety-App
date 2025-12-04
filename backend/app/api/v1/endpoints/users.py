from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.v1 import deps
from app.core import security
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate

router = APIRouter()

@router.post("/", response_model=UserSchema)
def create_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db_obj = User(
        email=user_in.email, 
        phone_number=user_in.phone_number,
        hashed_password=security.get_password_hash(user_in.password), 
        full_name=user_in.full_name
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(deps.get_current_user)):
    return current_user
