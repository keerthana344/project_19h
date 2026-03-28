from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, FacultyClearance
from auth import get_current_user

router = APIRouter(prefix="/faculty", tags=["faculty"])

@router.get("/pending")
def list_pending(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view pending approvals")
    
    pending = db.query(FacultyClearance).filter(
        FacultyClearance.faculty_id == current_user.id,
        FacultyClearance.status == "pending"
    ).all()
    return pending

@router.post("/approve/{clearance_id}")
def approve_clearance(clearance_id: int, status: str = "approved", remarks: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    clearance = db.query(FacultyClearance).filter(
        FacultyClearance.id == clearance_id,
        FacultyClearance.faculty_id == current_user.id
    ).first()
    
    if not clearance:
        raise HTTPException(status_code=404, detail="Clearance record not found")
    
    # Update status based on input, but keep track of low attendance in remarks
    clearance.status = status
    if clearance.attendance < 85.0 and status == "approved":
        clearance.remarks = f"[Low Attendance Alert: {clearance.attendance}%] " + remarks
    else:
        clearance.remarks = remarks
        
    db.commit()
    
    # Trigger notification for student
    from .notification_router import create_notification
    create_notification(
        user_id=clearance.request.student_id,
        message=f"Faculty {current_user.full_name or current_user.username} has {status} your clearance for {clearance.subject}.",
        db=db
    )

    # If this was the last faculty approval, notify the HOD
    if status == "approved":
        all_faculty_done = db.query(FacultyClearance).filter(
            FacultyClearance.request_id == clearance.request_id,
            FacultyClearance.status != "approved"
        ).count() == 0
        
        if all_faculty_done:
            hods = db.query(User).filter(User.role == "hod").all()
            for hod in hods:
                create_notification(
                    user_id=hod.id,
                    message=f"Clearance request #{clearance.request_id} from {clearance.request.student.username} is now ready for your final HOD approval.",
                    db=db
                )
    
    return {"message": f"Status updated to {clearance.status}"}
