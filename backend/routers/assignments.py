from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from models import Assignment, User
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from datetime import datetime
from routers import users as users_router

router = APIRouter()
SECRET_KEY = users_router.SECRET_KEY
ALGORITHM = users_router.ALGORITHM
UPLOAD_DIR = "uploads"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

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
    # Validate image types
    allowed_mime = {"image/jpeg", "image/png"}
    if file.content_type not in allowed_mime:
        raise HTTPException(status_code=400, detail="Only JPG and PNG images are allowed")

    # Ensure upload directory exists (absolute path)
    upload_abs_dir = os.path.join(BASE_DIR, UPLOAD_DIR)
    if not os.path.exists(upload_abs_dir):
        os.makedirs(upload_abs_dir)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = file.filename.replace(" ", "_")
    filename = f"{student_id}_{timestamp}_{safe_name}"
    full_disk_path = os.path.join(upload_abs_dir, filename)
    try:
        with open(full_disk_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Store a web path for frontend consumption
    web_path = f"{UPLOAD_DIR}/{filename}"
    new_assignment = Assignment(
        student_id=student_id,
        filename=file.filename,
        filepath=web_path,
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
    assignments = db.query(Assignment).filter(Assignment.student_id == student_id).all()
    # Compute uploaded_at from filename pattern if possible: studentid_YYYYmmddHHMMSS_name
    def parse_uploaded_at(name: str):
        try:
            parts = name.split("_")
            ts = parts[1]
            return datetime.strptime(ts, "%Y%m%d%H%M%S")
        except Exception:
            return None
    assignments_sorted = sorted(assignments, key=lambda a: parse_uploaded_at(os.path.basename(a.filepath)) or datetime.min, reverse=True)
    result = []
    for a in assignments_sorted:
        ts = parse_uploaded_at(os.path.basename(a.filepath))
        result.append({
            "id": a.id,
            "filename": a.filename,
            "filepath": a.filepath,
            "score": a.score,
            "comments": a.comments,
            "status": a.status,
            "uploaded_at": ts.isoformat() if ts else None,
        })
    return result

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    # Allow owner or elevated roles
    if current_user.id != assignment.student_id and current_user.role.lower() not in ["admin", "teacher", "ta", "hod"]:
        raise HTTPException(status_code=403, detail="Not allowed to delete this assignment")
    abs_path = assignment.filepath if os.path.isabs(assignment.filepath) else os.path.join(BASE_DIR, assignment.filepath)
    try:
        if os.path.exists(abs_path):
            os.remove(abs_path)
    except Exception:
        # Ignore file removal errors; continue to delete DB record
        pass
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}
