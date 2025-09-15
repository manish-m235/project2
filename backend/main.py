from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from models import User, Base
from schemas import UserCreate, UserOut
from database import SessionLocal, engine, get_db
from routers import courses, attendance, assignments, notices, enrollments

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- Auth Utilities ----------
def get_user_by_identifier(db: Session, identifier: str):
    """Find user by username OR email"""
    return db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_identifier(db, identifier)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------- Register ----------
@app.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # ✅ Check confirm password
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already taken")

    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        full_name=user.full_name,          # ✅ now included
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ---------- Login ----------
@app.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "role": user.role}

# ---------- Verify Token ----------
@app.get("/verify-token/{token}")
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user_id": payload.get("sub"), "role": payload.get("role")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------- Attendance All ----------
@app.get("/attendance/all")
def get_all_attendance(db: Session = Depends(get_db)):
    from models import Attendance
    records = db.query(Attendance).all()
    return [{"student_id": r.student_id, "course_id": r.course_id, "date": str(r.date), "status": r.status} for r in records]

# ---------- Include Routers ----------
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(notices.router, prefix="/notices", tags=["Notices"])
app.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
