from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, DepartmentClearance, ClearanceRequest
from auth import get_current_user

router = APIRouter(prefix="/department", tags=["department"])

@router.get("/all-status")
def list_all_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "dept_staff":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Return all department clearance records for this user's department
    clearances = db.query(DepartmentClearance).filter(
        DepartmentClearance.dept_name == current_user.department
    ).all()
    
    results = []
    for dc in clearances:
        results.append({
            "id": dc.id,
            "request_id": dc.request_id,
            "student_username": dc.request.student.username if (dc.request and dc.request.student) else "Unknown",
            "status": dc.status,
            "is_ready": dc.request.status == "hod_approved" if dc.request else False,
            "request_overall_status": dc.request.status if dc.request else "pending"
        })
    return results

@router.post("/approve/{clearance_id}")
def approve_clearance(clearance_id: int, remarks: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "dept_staff":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    clearance = db.query(DepartmentClearance).filter(
        DepartmentClearance.id == clearance_id,
        DepartmentClearance.dept_name == current_user.department
    ).first()
    
    if not clearance:
        raise HTTPException(status_code=404, detail="Clearance record not found for your department")
    
    clearance.status = "approved"
    clearance.remarks = remarks
    db.commit()
    
    from .notification_router import create_notification
    create_notification(
        user_id=clearance.request.student_id,
        message=f"Department staff has approved your clearance for {clearance.dept_name}.",
        db=db
    )
    
    return {"message": "Department clearance approved"}
