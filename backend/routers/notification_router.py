from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Notification
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Returns last 50 notifications for the user
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()
    return notifs

@router.post("/{id}/read")
def mark_read(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

# Utility to create notifications (to be called from other routers)
def create_notification(user_id: int, message: str, db: Session):
    notif = Notification(user_id=user_id, message=message)
    db.add(notif)
    db.commit()
