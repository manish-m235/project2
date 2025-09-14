from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import Course
from schemas import CourseCreate, CourseOut
from database import get_db

router = APIRouter()

@router.get("/", response_model=list[CourseOut])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@router.post("/", response_model=CourseOut)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(**course.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course
