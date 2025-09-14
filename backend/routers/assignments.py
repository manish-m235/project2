from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from models import Assignment
from database import get_db

router = APIRouter()

@router.post("/upload/{student_id}")
def upload_assignment(student_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = file.file.read()
    new_assignment = Assignment(
        student_id=student_id,
        content=contents.decode("utf-8"),
        score=None
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return {"message": "Assignment uploaded", "id": new_assignment.id}
