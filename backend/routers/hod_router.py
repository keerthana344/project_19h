from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ClearanceRequest, FacultyClearance, DepartmentClearance
from auth import get_current_user

router = APIRouter(prefix="/hod", tags=["hod"])

@router.get("/pending-all")
def list_pending_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hod":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    requests = db.query(ClearanceRequest).filter(ClearanceRequest.status == "pending").all()
    results = []
    for req in requests:
        pending_faculty = db.query(FacultyClearance).filter(FacultyClearance.request_id == req.id, FacultyClearance.status == "pending").first()
        results.append({
            "id": req.id,
            "student_id": req.student_id,
            "student_username": req.student.username if req.student else "Unknown",
            "status": req.status,
            "is_ready": not pending_faculty,
            "submitted_at": req.submitted_at.isoformat() if req.submitted_at else None
        })
    return results

@router.post("/approve/{request_id}")
def hod_approve(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hod":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = "hod_approved"
    db.commit()
    
    from .notification_router import create_notification
    # Notify Student
    create_notification(
        user_id=request.student_id,
        message="Your clearance request has been approved by the HOD and is now with Admin/Depts.",
        db=db
    )

    # Notify Admin
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            message=f"HOD has approved clearance request #{request_id}. Please perform final verification.",
            db=db
        )
    
    # Notify Dept Staff (Library, Hostel, etc.)
    # Note: DepartmentClearance records are already created for students, we just need to alert the staff of those depts.
    dept_staffs = db.query(User).filter(User.role == "dept_staff").all()
    for staff in dept_staffs:
        # Only notify if this staff belongs to a department that has a clearance record for this request
        # (Assuming department names match)
        create_notification(
            user_id=staff.id,
            message=f"HOD has approved request #{request_id} for student {request.student.username}. Please clear department dues for {staff.department}.",
            db=db
        )
    
    return {"message": "HOD approval completed"}
