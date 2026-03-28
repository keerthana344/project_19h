from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    full_name: str
    email: str
    role: str
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ClearanceRequestBase(BaseModel):
    student_id: int

class ClearanceRequestResponse(ClearanceRequestBase):
    id: int
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
