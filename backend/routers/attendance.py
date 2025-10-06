from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import date
from pydantic import BaseModel
from models import Attendance, User, Enrollment, Course
from database import get_db

router = APIRouter()

# ---------------------- Request Models ----------------------
class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    status: str  # "present" or "absent"

class AttendanceUpdate(BaseModel):
    status: str  # "present" or "absent"

# ---------------------- Mark Attendance (POST) ----------------------
@router.post("/mark")
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    today = date.today()

    # Ensure student is enrolled
    enrollment = db.query(Enrollment).filter_by(student_id=attendance.student_id, course_id=attendance.course_id).first()
    if not enrollment:
        raise HTTPException(status_code=400, detail="Student not enrolled in this course")

    # Check if already exists today
    record = db.query(Attendance).filter_by(
        student_id=attendance.student_id, course_id=attendance.course_id, date=today
    ).first()
    if record:
        record.status = attendance.status.lower()
        db.commit()
        db.refresh(record)
        return {"message": f"Attendance updated as {attendance.status}", "attendance": record}

    # Create new
    record = Attendance(
        student_id=attendance.student_id,
        course_id=attendance.course_id,
        date=today,
        status=attendance.status.lower()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": f"Attendance marked as {attendance.status}", "attendance": record}

# ---------------------- Update Attendance (PUT) ----------------------
@router.put("/update/{attendance_id}")
def update_attendance(attendance_id: int, attendance: AttendanceUpdate, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if attendance.status.lower() not in ["present", "absent"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    record.status = attendance.status.lower()
    db.commit()
    db.refresh(record)
    return {"message": "Attendance updated", "attendance": record}

# ---------------------- Attendance Summary ----------------------
@router.get("/student/{user_id}")
def get_user_attendance_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.attendances).joinedload(Attendance.course)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Fetch enrolled courses
    enrollments = db.query(Enrollment).filter_by(student_id=user_id).all()
    courses = db.query(Course).filter(Course.id.in_([e.course_id for e in enrollments])).all()
    today = date.today()
    attendance_history = []
    for course in courses:
        record = db.query(Attendance).filter_by(student_id=user_id, course_id=course.id, date=today).first()
        attendance_history.append({
            "id": record.id if record else None,
            "student_name": user.full_name,
            "course_id": course.id,
            "course_name": course.name,
            "date": str(today),
            "status": record.status if record else "none"
        })
    return {"attendance": attendance_history}
