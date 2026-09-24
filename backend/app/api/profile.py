from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from uuid import UUID
from app.db import get_db
from app.auth import current_user_id

router=APIRouter(tags=["profile"])

class ProfileUpdate(BaseModel):
    name: str | None = None
    education: str | None = None
    profile_image: str | None = None

@router.get("/profile")
def profile(user_id: UUID=Depends(current_user_id),db:Session=Depends(get_db)):
    row=db.execute(text("SELECT * FROM profiles WHERE id=:u"),{"u":str(user_id)}).mappings().first()
    if not row: return {"exists":False}
    return dict(row)

@router.put("/profile")
def update_profile(req:ProfileUpdate,user_id:UUID=Depends(current_user_id),db:Session=Depends(get_db)):
    db.execute(text("""
      INSERT INTO profiles(id,email,name,education,profile_image)
      VALUES(:u,'','',:e,:i)
      ON CONFLICT(id) DO UPDATE SET
        name=COALESCE(NULLIF(:n,''),profiles.name),
        education=COALESCE(:e,profiles.education),
        profile_image=COALESCE(:i,profiles.profile_image),
        updated_at=now()
    """),{"u":str(user_id),"n":req.name or "","e":req.education,"i":req.profile_image})
    db.commit()
    return {"saved":True}

@router.get("/settings")
def settings(user_id:UUID=Depends(current_user_id),db:Session=Depends(get_db)):
    row=db.execute(text("SELECT * FROM user_settings WHERE user_id=:u"),{"u":str(user_id)}).mappings().first()
    return dict(row) if row else {"appearance":"system","notifications_enabled":True,"ai_enabled":True,"leaderboard_visibility":False}

class SettingsUpdate(BaseModel):
    appearance:str="system"
    notifications_enabled:bool=True
    ai_enabled:bool=True
    leaderboard_visibility:bool=False

@router.put("/settings")
def update_settings(req:SettingsUpdate,user_id:UUID=Depends(current_user_id),db:Session=Depends(get_db)):
    db.execute(text("""
      INSERT INTO user_settings(user_id,appearance,notifications_enabled,ai_enabled,leaderboard_visibility)
      VALUES(:u,:a,:n,:ai,:l)
      ON CONFLICT(user_id) DO UPDATE SET appearance=:a,notifications_enabled=:n,ai_enabled=:ai,
      leaderboard_visibility=:l,updated_at=now()
    """),{"u":str(user_id),"a":req.appearance,"n":req.notifications_enabled,"ai":req.ai_enabled,"l":req.leaderboard_visibility})
    db.commit()
    return {"saved":True}
