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
            "is_ready": dc.request.status == "admin_approved" if dc.request else False,
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
    
    # Check if this was the last pending department for the student
    all_depts = db.query(DepartmentClearance).filter(DepartmentClearance.request_id == clearance.request_id).all()
    if all([d.status == "approved" for d in all_depts]):
        clearance.request.status = "approved"
        from .notification_router import create_notification
        create_notification(
            user_id=clearance.request.student_id,
            message="Congratulations! All department dues are cleared and your NO-DUE request is fully approved.",
            db=db
        )
        
    db.commit()
    
    from .notification_router import create_notification
    create_notification(
        user_id=clearance.request.student_id,
        message=f"Department staff has approved your clearance for {clearance.dept_name}.",
        db=db
    )
    
    return {"message": "Department clearance approved"}

@router.get("/hall-ticket/request/{request_id}")
def get_department_hall_ticket(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "dept_staff":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="No clearance request found")
        
    if request.status != "approved":
        raise HTTPException(status_code=400, detail="Clearance is not fully approved yet.")
        
    student_user = request.student
    dept_cls = db.query(DepartmentClearance).filter(DepartmentClearance.request_id == request.id).all()
    faculty_cls = db.query(FacultyClearance).filter(FacultyClearance.request_id == request.id).all()
    
    return {
        "student": {
            "name": student_user.full_name or student_user.username,
            "username": student_user.username,
            "department": student_user.department
        },
        "request_id": request.id,
        "date": request.submitted_at,
        "faculty_clearances": faculty_cls,
        "department_clearances": dept_cls
    }
