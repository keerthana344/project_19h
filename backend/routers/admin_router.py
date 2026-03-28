from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ClearanceRequest
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    total_users = db.query(User).count()
    total_requests = db.query(ClearanceRequest).count()
    approved_requests = db.query(ClearanceRequest).filter(ClearanceRequest.status == "approved").count()
    pending_requests = db.query(ClearanceRequest).filter(ClearanceRequest.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_requests": total_requests,
        "approved": approved_requests,
        "pending": pending_requests
    }

@router.get("/all-status")
def list_all_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    requests = db.query(ClearanceRequest).all()
    results = []
    for req in requests:
        results.append({
            "id": req.id,
            "student_username": req.student.username if req.student else "Unknown",
            "status": req.status,
            "is_ready": req.status == "hod_approved"
        })
    return results

@router.post("/approve/{request_id}")
def admin_approve(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request.status = "admin_approved"
    db.commit()
    
    from .notification_router import create_notification
    create_notification(
        user_id=request.student_id,
        message="Your clearance request has been approved by the Admin and is now pending Department Dues.",
        db=db
    )
    
    return {"message": "Request fully approved"}

@router.get("/all-requests")
def list_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return db.query(ClearanceRequest).all()
