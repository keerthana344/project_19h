from app import app, db, User, Student, Faculty, Department, Attendance, Due
from werkzeug.security import generate_password_hash

def seed_data():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Create departments
        cs = Department(name="Computer Science")
        ec = Department(name="Electronics")
        me = Department(name="Mechanical Engineering")
        db.session.add_all([cs, ec, me])
        db.session.commit()

        # Create Users
        # Student 1: Normal
        # Student 2: Low Attendance
        # Student 3: Pendings Dues
        users = [
            User(username="student1", password_hash=generate_password_hash("pass123"), role="student"),
            User(username="student2", password_hash=generate_password_hash("pass123"), role="student"),
            User(username="student3", password_hash=generate_password_hash("pass123"), role="student"),
            User(username="faculty1", password_hash=generate_password_hash("pass123"), role="faculty"),
            User(username="faculty2", password_hash=generate_password_hash("pass123"), role="faculty"),
            User(username="admin1", password_hash=generate_password_hash("pass123"), role="admin"),
            User(username="hod1", password_hash=generate_password_hash("pass123"), role="hod"),
            User(username="staff1", password_hash=generate_password_hash("pass123"), role="staff"),
        ]
        db.session.add_all(users)
        db.session.commit()

        # Create Students
        s1 = Student(user_id=users[0].id, name="John Doe", roll_num="CS101", dept_id=cs.id)
        s2 = Student(user_id=users[1].id, name="Jane Smith", roll_num="CS102", dept_id=cs.id)
        s3 = Student(user_id=users[2].id, name="Bob Wilson", roll_num="EC101", dept_id=ec.id)
        db.session.add_all([s1, s2, s3])
        db.session.commit()

        # Create Faculty
        f1 = Faculty(user_id=users[3].id, name="Dr. Smith", dept_id=cs.id)
        f2 = Faculty(user_id=users[4].id, name="Prof. Johnson", dept_id=ec.id)
        db.session.add_all([f1, f2])
        
        # Attendance
        # S1: Good
        db.session.add(Attendance(student_id=s1.id, subject="Data Structures", percentage=90.0))
        db.session.add(Attendance(student_id=s1.id, subject="Algorithms", percentage=88.0))
        # S2: Low Attendance
        db.session.add(Attendance(student_id=s2.id, subject="Data Structures", percentage=75.0))
        db.session.add(Attendance(student_id=s2.id, subject="Algorithms", percentage=92.0))
        # S3: Mixed
        db.session.add(Attendance(student_id=s3.id, subject="Circuits", percentage=86.0))

        # Dues
        db.session.add(Due(student_id=s1.id, type="library", amount=0, is_cleared=True))
        db.session.add(Due(student_id=s1.id, type="hostel", amount=0, is_cleared=True))
        
        db.session.add(Due(student_id=s2.id, type="library", amount=0, is_cleared=True))
        db.session.add(Due(student_id=s2.id, type="hostel", amount=0, is_cleared=True))

        db.session.add(Due(student_id=s3.id, type="library", amount=200, is_cleared=False))
        db.session.add(Due(student_id=s3.id, type="accounts", amount=1500, is_cleared=False))

        db.session.commit()
        print("Database seeded with comprehensive data!")

if __name__ == "__main__":
    seed_data()
