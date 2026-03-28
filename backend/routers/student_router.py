from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, ClearanceRequest, FacultyClearance, DepartmentClearance
from schemas import ClearanceRequestResponse
from auth import get_current_user

router = APIRouter(prefix="/student", tags=["student"])

@router.post("/request", response_model=ClearanceRequestResponse)
def submit_request(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit requests")
    
    # Check if a request already exists
    existing = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Clearance request already submitted")
    
    new_request = ClearanceRequest(student_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Initialize faculty and department clearances (Mocking for now)
    # In a real system, these would be based on the student's subjects/department
    faculty_list = db.query(User).filter(User.role == "faculty").all()
    for faculty in faculty_list:
        fc = FacultyClearance(
            request_id=new_request.id,
            faculty_id=faculty.id,
            subject="General", # Placeholder
            attendance=90.0, # Placeholder
            marks=80.0
        )
        db.add(fc)
    
    depts = ["Library", "Hostel", "Accounts", "Sports"]
    for dept in depts:
        dc = DepartmentClearance(request_id=new_request.id, dept_name=dept)
        db.add(dc)
    
    db.commit()
    return new_request

@router.get("/status", response_model=ClearanceRequestResponse)
def get_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    request = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == current_user.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="No request found")
    return request

@router.get("/details")
def get_details(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    request = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == current_user.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="No request found")
    
    faculty_cls = db.query(FacultyClearance).filter(FacultyClearance.request_id == request.id).all()
    dept_cls = db.query(DepartmentClearance).filter(DepartmentClearance.request_id == request.id).all()
    
    return {
        "request": request,
        "faculty_clearances": faculty_cls,
        "department_clearances": dept_cls
    }
@router.get("/hall-ticket")
def get_hall_ticket_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    request = db.query(ClearanceRequest).filter(ClearanceRequest.student_id == current_user.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="No clearance request found")
        
    # Check if fully approved
    if request.status != "approved":
        raise HTTPException(status_code=400, detail="Your clearance is not yet fully approved by Admin.")
        
    # Check if all department clearances are approved
    dept_cls = db.query(DepartmentClearance).filter(DepartmentClearance.request_id == request.id).all()
    all_dept_cleared = all([dc.status == "approved" for dc in dept_cls])
    
    if not all_dept_cleared:
         raise HTTPException(status_code=400, detail="One or more department clearances are still pending.")
         
    faculty_cls = db.query(FacultyClearance).filter(FacultyClearance.request_id == request.id).all()
    
    return {
        "student": {
            "name": current_user.full_name or current_user.username,
            "username": current_user.username,
            "department": current_user.department
        },
        "request_id": request.id,
        "date": request.submitted_at,
        "faculty_clearances": faculty_cls,
        "department_clearances": dept_cls
    }
