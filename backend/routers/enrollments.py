from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Enrollment, Course, User
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")
        return user
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.get("/", response_model=list[dict])
def get_enrollments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "student":
        raise HTTPException(status_code=403, detail="Only students can view enrollments")

    enrollments = db.query(Enrollment).filter_by(student_id=current_user.id).all()
    return [{"course_id": e.course_id} for e in enrollments]

@router.post("/enroll/{course_id}", response_model=dict)
def enroll_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll")

    existing = db.query(Enrollment).filter_by(student_id=current_user.id, course_id=course_id).first()
    if existing:
        return {"message": "Already enrolled"}

    enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled"}
