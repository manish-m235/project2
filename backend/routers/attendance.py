from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from models import Attendance, User, Enrollment, Course
from database import get_db

router = APIRouter()

@router.get("/today/{user_id}")
def get_today_attendance(user_id: int, db: Session = Depends(get_db)):
    today = date.today()
    record = db.query(Attendance).filter_by(student_id=user_id, date=today).first()
    if not record:
        return {"status": "absent", "date": str(today)}
    return {"status": record.status, "date": str(record.date)}

@router.get("/student/{user_id}")
def get_user_attendance_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch enrolled courses
    enrollments = db.query(Enrollment).filter_by(student_id=user_id).all()
    enrolled_course_ids = [e.course_id for e in enrollments]

    courses = db.query(Course).filter(Course.id.in_(enrolled_course_ids)).all()
    enrolled_courses = [{"id": c.id, "name": c.name} for c in courses]

    # Attendance history
    records = db.query(Attendance).filter_by(student_id=user_id).order_by(Attendance.date.desc()).all()
    attendance_history = [{"date": str(r.date), "status": r.status} for r in records]

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "enrolled_courses": enrolled_courses  # ✅ Now always included
        },
        "attendance": attendance_history
    }
