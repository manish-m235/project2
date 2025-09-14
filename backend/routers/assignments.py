from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from models import Assignment, User
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from datetime import datetime

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
UPLOAD_DIR = "uploads"

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

@router.post("/upload/{student_id}")
def upload_assignment(student_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Ensure upload directory exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{student_id}_{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(filepath, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    new_assignment = Assignment(
        student_id=student_id,
        filename=file.filename,
        filepath=filepath,
        status="submitted"
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {"message": "Assignment uploaded successfully", "id": new_assignment.id}


# TA Review
@router.post("/review/{assignment_id}")
def ta_review_assignment(assignment_id: int, comments: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "ta":
        raise HTTPException(status_code=403, detail="Only TAs can review assignments")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.comments = comments
    assignment.status = "reviewed"
    db.commit()
    return {"message": "Assignment reviewed"}


# Teacher Evaluate
@router.post("/evaluate/{assignment_id}")
def teacher_evaluate_assignment(assignment_id: int, score: float, comments: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can evaluate assignments")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.score = score
    if comments:
        assignment.comments = comments
    assignment.status = "graded"
    db.commit()
    return {"message": "Assignment graded"}


# HOD Approval
@router.post("/approval/{assignment_id}")
def hod_approval(assignment_id: int, approved: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "hod":
        raise HTTPException(status_code=403, detail="Only HOD can approve assignments")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.status = "approved" if approved else "rejected"
    db.commit()
    return {"message": f"Assignment {'approved' if approved else 'rejected'}"}


# Fetch assignment history
@router.get("/history/{student_id}")
def assignment_history(student_id: int, db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.student_id == student_id).order_by(Assignment.uploaded_at.desc()).all()
    return [
        {
            "id": a.id,
            "filename": a.filename,
            "filepath": a.filepath,
            "score": a.score,
            "comments": a.comments,
            "status": a.status,
            "uploaded_at": a.uploaded_at
        } for a in assignments
    ]
