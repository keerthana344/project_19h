from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # student, faculty, admin, hod, staff

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    roll_num = db.Column(db.String(20), unique=True, nullable=False)
    dept_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    is_hosteller = db.Column(db.Boolean, default=False)
    
    attendance = db.relationship('Attendance', backref='student', lazy=True)
    dues = db.relationship('Due', backref='student', lazy=True)
    requests = db.relationship('ClearanceRequest', backref='student', lazy=True)

class Faculty(db.Model):
    __tablename__ = 'faculty'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dept_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)

class ClearanceRequest(db.Model):
    __tablename__ = 'clearance_requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    status = db.Column(db.String(30), default='pending') # pending, faculty_approved, admin_approved, hod_approved, completed, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    approvals = db.relationship('Approval', backref='request', lazy=True)

class Approval(db.Model):
    __tablename__ = 'approvals'
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('clearance_requests.id'), nullable=False)
    approver_role = db.Column(db.String(20), nullable=False)
    approver_id = db.Column(db.Integer, nullable=True) # User ID who approved
    status = db.Column(db.String(20), nullable=False) # approved, rejected
    remarks = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Due(db.Model):
    __tablename__ = 'dues'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False) # hostel, library, accounts
    amount = db.Column(db.Float, default=0.0)
    is_cleared = db.Column(db.Boolean, default=False)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    percentage = db.Column(db.Float, nullable=False)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
