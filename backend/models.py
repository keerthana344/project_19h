from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    DEPT_STAFF = "dept_staff"
    HOD = "hod"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # For simplicity using string or Enum
    department = Column(String) # For faculty/staff/hod

class ClearanceRequest(Base):
    __tablename__ = "clearance_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending") # pending, approved, rejected
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("User")

class FacultyClearance(Base):
    __tablename__ = "faculty_clearances"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("clearance_requests.id"))
    faculty_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    attendance = Column(Float)
    marks = Column(Float)
    status = Column(String, default="pending") # pending, approved, rejected
    remarks = Column(String, nullable=True)
    
    request = relationship("ClearanceRequest")
    faculty = relationship("User")

class DepartmentClearance(Base):
    __tablename__ = "department_clearances"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("clearance_requests.id"))
    dept_name = Column(String) # Library, Hostel, Accounts, etc.
    status = Column(String, default="pending")
    remarks = Column(String, nullable=True)

    request = relationship("ClearanceRequest")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
