from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.v1 import deps
from app.models.setting import SystemSetting
from app.models.user import User
from app.schemas.threat import Setting, SettingCreate

router = APIRouter()

@router.get("/", response_model=List[Setting])
def get_settings(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return db.query(SystemSetting).filter(SystemSetting.owner_id == current_user.id).all()

@router.post("/", response_model=Setting)
def update_setting(setting_in: SettingCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    db_setting = db.query(SystemSetting).filter(SystemSetting.key == setting_in.key, SystemSetting.owner_id == current_user.id).first()
    if db_setting:
        db_setting.value = setting_in.value
        db_setting.description = setting_in.description
    else:
        db_setting = SystemSetting(**setting_in.model_dump(), owner_id=current_user.id)
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting
