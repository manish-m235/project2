from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Enrollment, User, Course
from database import get_db

router = APIRouter()

# ✅ Get all enrollments
@router.get("/")
def get_all_enrollments(db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).all()
    return [
        {
            "id": e.id,
            "student_id": e.student_id,
            "course_id": e.course_id
        }
        for e in enrollments
    ]


# ✅ Enroll a student into a course (only 1 allowed)
@router.post("/enroll/{course_id}")
def enroll_student(course_id: int, student_id: int, db: Session = Depends(get_db)):
    # Check if student exists
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Restrict: One student → One course only
    existing_any = db.query(Enrollment).filter_by(student_id=student_id).first()
    if existing_any:
        raise HTTPException(status_code=400, detail="Student already enrolled in another course")

    # Create enrollment
    enrollment = Enrollment(student_id=student_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {"message": f"Student {student.username} enrolled in {course.name}"}
