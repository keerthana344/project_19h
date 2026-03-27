# No-Due Clearance Management System

A full-stack digital system to automate the college no-due clearance process.

## Tech Stack
- **Frontend**: React.js (Vite), Axios, React Router
- **Backend**: Python (Flask), SQLAlchemy, JWT Authentication
- **Database**: PostgreSQL (or SQLite for development)

## Directory Structure
- `backend/`: Flask API and Database models
- `frontend/`: React application

## Setup Instructions

### Backend Setup
1. Navigate to `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. (Optional) Set `DATABASE_URL` in `.env`. Defaults to a local PostgreSQL or SQLite.
6. Initialize database and seed data: `python seed.py`
7. Run the server: `python app.py`

### Frontend Setup
1. Navigate to `frontend/` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## User Roles & Credentials (Dummy Data)
- **Student**: `student1` / `pass123`
- **Faculty**: `faculty1` / `pass123`
- **Admin**: `admin1` / `pass123`
- **HOD**: `hod1` / `pass123`
- **Staff**: `staff1` / `pass123`

## Features
- Role-based dashboard access.
- Real-time status tracking for students.
- Attendance-based eligibility check for faculty.
- Dues management for admin.
- Bulk approval for HOD.
- Hall ticket issuance for staff.
