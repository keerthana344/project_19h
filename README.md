# No-Due Clearance Management System

A digital, role-based clearance system for colleges to automate the no-due process.

## Features
- **Role-Based Access**: Student, Faculty, Department Staff, HOD, and Admin.
- **Automated Eligibility**: Flagging low attendance (< 85%) and pending dues.
- **Real-Time Tracking**: Visual pipeline for students to monitor progress.
- **Analytics**: Admin dashboard with system-wide statistics.
- **Secure**: JWT-based authentication with protected routes.

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy (SQLite)
- **Frontend**: React.js (Vite), Vanilla CSS (Glassmorphism), Lucide React Icons

## Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## User Roles (Sample Credentials)
- Register users via the `/register` page with appropriate roles.
- Use 'admin' in username for Admin role mocking (or select in dropdown).
