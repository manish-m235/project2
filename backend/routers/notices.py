from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Notice, User
from schemas import NoticeCreate
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
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
def get_notices(db: Session = Depends(get_db)):
    notices = db.query(Notice).order_by(Notice.id.desc()).all()
    return [{"title": n.title, "message": n.message, "posted_by": n.posted_by} for n in notices]

@router.post("/", response_model=dict)
def post_notice(notice: NoticeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not hasattr(current_user, "role") or current_user.role is None:
        raise HTTPException(status_code=403, detail="User role not found")

    if current_user.role.lower() == "student":
        raise HTTPException(status_code=403, detail="Students cannot post notices")

    new_notice = Notice(
        title=notice.title,
        message=notice.message,
        posted_by=current_user.username
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)

    return {"message": "Notice posted", "id": new_notice.id}
