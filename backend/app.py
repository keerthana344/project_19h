from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from models import db, User, Student, Faculty, Department, ClearanceRequest, Approval, Due, Attendance, Notification
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
# PostgreSQL connection string would normally go here. Using SQLite for demo or placeholder URI.
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///nodue.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')

db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Helper function to check role
def role_required(role):
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            identity = get_jwt_identity()
            user = User.query.get(identity['id'])
            if user.role != role and user.role != 'admin': # Admin can usually do everything
                return jsonify({"msg": "Unauthorized role"}), 403
            return fn(*args, **kwargs)
        decorator.__name__ = fn.__name__
        return decorator
    return wrapper

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and check_password_hash(user.password_hash, data.get('password')):
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify(access_token=access_token, role=user.role, user_id=user.id), 200
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/student/request', methods=['POST'])
@jwt_required()
def submit_request():
    identity = get_jwt_identity()
    if identity['role'] != 'student':
         return jsonify({"msg": "Only students can submit requests"}), 403
    
    student = Student.query.filter_by(user_id=identity['id']).first()
    # Check if existing pending or approved request
    existing_pending = ClearanceRequest.query.filter_by(student_id=student.id, status='pending').first()
    if existing_pending:
        return jsonify({"msg": "Already have a pending request"}), 400
    
    # Allow new request if last one was rejected or no request exists
    # If there's an active flow (faculty_approved, admin_approved etc), don't allow new one
    active_statuses = ['pending', 'faculty_approved', 'admin_approved', 'hod_approved']
    active_req = ClearanceRequest.query.filter(ClearanceRequest.student_id == student.id, ClearanceRequest.status.in_(active_statuses)).first()
    if active_req:
        return jsonify({"msg": "An active request is already in progress"}), 400

    new_request = ClearanceRequest(student_id=student.id)
    db.session.add(new_request)
    
    # Notification for student
    notif = Notification(user_id=identity['id'], message="Your clearance request has been submitted successfully.")
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({"msg": "Request submitted successfully", "id": new_request.id}), 201

@app.route('/api/student/status', methods=['GET'])
@jwt_required()
def get_status():
    identity = get_jwt_identity()
    student = Student.query.filter_by(user_id=identity['id']).first()
    req = ClearanceRequest.query.filter_by(student_id=student.id).order_by(ClearanceRequest.created_at.desc()).first()
    if not req:
        return jsonify({"msg": "No request found"}), 404
    
    return jsonify({
        "status": req.status,
        "created_at": req.created_at,
        "approvals": [{"role": a.approver_role, "status": a.status, "remarks": a.remarks} for a in req.approvals]
    }), 200

# Faculty: View students in department and approve/reject
@app.route('/api/faculty/requests', methods=['GET'])
@jwt_required()
def faculty_get_requests():
    identity = get_jwt_identity()
    if identity['role'] != 'faculty':
        return jsonify({"msg": "Unauthorized"}), 403
    
    faculty = Faculty.query.filter_by(user_id=identity['id']).first()
    # Find students in the SAME department
    requests = ClearanceRequest.query.join(Student).filter(Student.dept_id == faculty.dept_id).all()
    
    return jsonify([{
        "id": r.id,
        "student_name": r.student.name,
        "roll_num": r.student.roll_num,
        "status": r.status,
        "attendance": [{"subject": a.subject, "percentage": a.percentage} for a in r.student.attendance]
    } for r in requests]), 200

@app.route('/api/faculty/approve/<int:request_id>', methods=['POST'])
@role_required('faculty')
def faculty_approve(request_id):
    identity = get_jwt_identity()
    data = request.json
    req = ClearanceRequest.query.get(request_id)
    
    # Automated eligibility check: Attendance >= 85%
    # For demo, if any subject attendance < 85%, we can flag it or auto-reject
    low_attendance = [a for a in req.student.attendance if a.percentage < 85]
    
    status = data.get('status')
    remarks = data.get('remarks', '')
    
    if low_attendance and status == 'approved':
        # Auto-flagging logic: we still allow faculty to approve but add a warning or force rejection
        # User asked for "automated eligibility check (attendance <85% → auto-flag)"
        remarks = f"[AUTO-FLAG: Low Attendance] {remarks}"
    
    approval = Approval(
        request_id=request_id,
        approver_role='faculty',
        approver_id=identity['id'],
        status=status,
        remarks=remarks
    )
    db.session.add(approval)
    
    if status == 'approved':
        req.status = 'faculty_approved'
        msg = "Your request has been approved by Faculty."
    else:
        req.status = 'rejected'
        msg = f"Your request was rejected by Faculty. Reason: {remarks}"
    
    # Notification for student
    notif = Notification(user_id=req.student.user_id, message=msg)
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({"msg": "Faculty action recorded"}), 200

# Admin: Manage Dues
@app.route('/api/admin/requests', methods=['GET'])
@jwt_required()
def admin_get_requests():
    if get_jwt_identity()['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    # Admin sees requests that are faculty_approved
    requests = ClearanceRequest.query.filter_by(status='faculty_approved').all()
    return jsonify([{
        "id": r.id,
        "student_name": r.student.name,
        "roll_num": r.student.roll_num,
        "dues": [{"type": d.type, "amount": d.amount, "is_cleared": d.is_cleared} for d in r.student.dues]
    } for r in requests]), 200

@app.route('/api/admin/approve/<int:request_id>', methods=['POST'])
@jwt_required()
def admin_approve(request_id):
    identity = get_jwt_identity()
    data = request.json
    req = ClearanceRequest.query.get(request_id)
    
    # Check if all dues are cleared
    uncleared = Due.query.filter_by(student_id=req.student_id, is_cleared=False).first()
    status = data.get('status')
    
    if uncleared and status == 'approved':
        return jsonify({"msg": "Cannot approve. Dues still pending."}), 400

    approval = Approval(
        request_id=request_id,
        approver_role='admin',
        approver_id=identity['id'],
        status=status,
        remarks=data.get('remarks')
    )
    db.session.add(approval)
    
    if status == 'approved':
        req.status = 'admin_approved'
        msg = "Your request has been approved by Admin (Dues Cleared)."
    else:
        req.status = 'rejected'
        msg = "Your request was rejected by Admin."
        
    # Notification for student
    notif = Notification(user_id=req.student.user_id, message=msg)
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({"msg": "Admin action recorded"}), 200

# HOD: Final Approval
@app.route('/api/hod/requests', methods=['GET'])
@jwt_required()
def hod_get_requests():
    identity = get_jwt_identity()
    if identity['role'] != 'hod':
        return jsonify({"msg": "Unauthorized"}), 403
    
    # HOD sees requests that are admin_approved
    requests = ClearanceRequest.query.filter_by(status='admin_approved').all()
    return jsonify([{
        "id": r.id,
        "student_name": r.student.name,
        "roll_num": r.student.roll_num,
        "status": r.status
    } for r in requests]), 200

@app.route('/api/hod/approve/<int:request_id>', methods=['POST'])
@role_required('hod')
def hod_approve(request_id):
    identity = get_jwt_identity()
    data = request.json
    req = ClearanceRequest.query.get(request_id)
    
    status = data.get('status')
    approval = Approval(
        request_id=request_id,
        approver_role='hod',
        approver_id=identity['id'],
        status=status,
        remarks=data.get('remarks')
    )
    db.session.add(approval)
    
    if status == 'approved':
        req.status = 'hod_approved'
        msg = "Final approval given by HOD."
    else:
        req.status = 'rejected'
        msg = "Your request was rejected by HOD."
        
    # Notification for student
    notif = Notification(user_id=req.student.user_id, message=msg)
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({"msg": "HOD action recorded"}), 200

@app.route('/api/hod/bulk-approve', methods=['POST'])
@jwt_required()
def hod_bulk_approve():
    identity = get_jwt_identity()
    if identity['role'] != 'hod':
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.json
    request_ids = data.get('request_ids', [])
    for rid in request_ids:
        req = ClearanceRequest.query.get(rid)
        if req and req.status == 'admin_approved':
            req.status = 'hod_approved'
            approval = Approval(
                request_id=rid,
                approver_role='hod',
                approver_id=identity['id'],
                status='approved',
                remarks='Bulk approved by HOD'
            )
            db.session.add(approval)
            notif = Notification(user_id=req.student.user_id, message="Final approval given by HOD (Bulk).")
            db.session.add(notif)
            
    db.session.commit()
    return jsonify({"msg": f"Bulk approved {len(request_ids)} requests"}), 200

# Staff: Issue Hall Ticket
@app.route('/api/staff/requests', methods=['GET'])
@jwt_required()
def staff_get_requests():
    if get_jwt_identity()['role'] != 'staff':
        return jsonify({"msg": "Unauthorized"}), 403
    
    requests = ClearanceRequest.query.filter_by(status='hod_approved').all()
    return jsonify([{
        "id": r.id,
        "student_name": r.student.name,
        "roll_num": r.student.roll_num
    } for r in requests]), 200

@app.route('/api/staff/issue/<int:request_id>', methods=['POST'])
@role_required('staff')
def staff_issue(request_id):
    req = ClearanceRequest.query.get(request_id)
    req.status = 'completed' # Hall ticket issued
    db.session.commit()
    return jsonify({"msg": "Hall ticket issued successfully"}), 200

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    identity = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=identity['id']).order_by(Notification.timestamp.desc()).all()
    return jsonify([{
        "id": n.id,
        "message": n.message,
        "is_read": n.is_read,
        "timestamp": n.timestamp
    } for n in notifs]), 200

@app.route('/api/notifications/read/<int:notif_id>', methods=['PATCH'])
@jwt_required()
def mark_notification_read(notif_id):
    identity = get_jwt_identity()
    notif = Notification.query.filter_by(id=notif_id, user_id=identity['id']).first()
    if not notif:
        return jsonify({"msg": "Notification not found"}), 404
    
    notif.is_read = True
    db.session.commit()
    return jsonify({"msg": "Notification marked as read"}), 200

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    if get_jwt_identity()['role'] not in ['admin', 'hod']:
        return jsonify({"msg": "Unauthorized"}), 403
    
    total_requests = ClearanceRequest.query.count()
    completed = ClearanceRequest.query.filter_by(status='completed').count()
    pending = ClearanceRequest.query.filter(ClearanceRequest.status != 'completed', ClearanceRequest.status != 'rejected').count()
    rejected = ClearanceRequest.query.filter_by(status='rejected').count()
    
    return jsonify({
        "total": total_requests,
        "completed": completed,
        "pending": pending,
        "rejected": rejected
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
