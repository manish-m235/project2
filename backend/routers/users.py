from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from database import get_db
from models import User
from schemas import UserCreate, UserOut, UserLogin

router = APIRouter()

# ---------- Security ----------
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash("yourpassword")

# ---------- Utils ----------
def get_user_by_identifier(db: Session, identifier: str):
    return db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_identifier(db, identifier)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------- Dependency for Admin ----------
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------- Register ----------
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    existing = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already taken")
    # Enforce allowed roles; allow admin only if none exists
    allowed_roles = {"student", "teacher", "ta", "hod", "admin"}
    role_lower = user.role.lower()
    if role_lower not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role. Allowed roles: student, teacher, ta, hod, admin")
    if role_lower == "admin":
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Only one admin allowed")
        status = "active"  # First/only admin is active immediately
        # normalize role to 'admin'
        user.role = "admin"
    else:
        status = "pending"
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        status=status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ---------- Login ----------
@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.username_or_email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    if user.status == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending admin approval")
    elif user.status == "rejected":
        raise HTTPException(status_code=403, detail="Your registration was rejected by admin")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "role": user.role}}

# ---------- Pending users (Admin only) ----------
@router.get("/pending")
def pending_users(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    pending = db.query(User).filter(User.status == "pending").all()
    return [
        {"id": u.id, "username": u.username, "full_name": u.full_name, "role": u.role, "email": u.email}
        for u in pending
    ]

# ---------- Get user ----------
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ---------- Approve / Reject user ----------
from fastapi import Body
@router.put("/approve/{user_id}")
def approve_user(user_id: int, action: str = Body(..., embed=True), current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    user.status = "active" if action == "approve" else "rejected"
    db.commit()
    return {"message": f"User {user.full_name} has been {user.status}"}
