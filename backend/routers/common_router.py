from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ClearanceRequest, FacultyClearance, DepartmentClearance
from auth import get_current_user

router = APIRouter(prefix="/common", tags=["common"])

@router.get("/request/{id}/details")
def get_request_details(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Basic check to ensure user is logged in (already done by get_current_user)
    
    request = db.query(ClearanceRequest).filter(ClearanceRequest.id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    faculty_clearances = db.query(FacultyClearance).filter(FacultyClearance.request_id == id).all()
    department_clearances = db.query(DepartmentClearance).filter(DepartmentClearance.request_id == id).all()
    
    return {
        "id": request.id,
        "status": request.status,
        "submitted_at": request.submitted_at,
        "faculty_clearances": faculty_clearances,
        "department_clearances": department_clearances
    }
