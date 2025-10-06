from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from models import Base, User, Attendance, Course
from database import get_db, engine, SessionLocal
from routers import users, courses, attendance, assignments, notices, enrollments
from fastapi.staticfiles import StaticFiles

# -------------------- App & DB --------------------
app = FastAPI(title="Academic Portal Backend")
Base.metadata.create_all(bind=engine)
# Serve uploaded files so frontend can access images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# -------------------- CORS ------------------------
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

# -------------------- Ensure Default Admin -----------------
# Creates a default admin once if none exists (no self-registration for admin)
@app.on_event("startup")
def ensure_default_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if not existing_admin:
            default_username = "manish"
            default_email = "manishmisrty235@gmail.com"
            default_password = "12345"  
            hashed = pwd_context.hash(default_password)
            admin = User(
                full_name="Manish Mistry       ",
                username=default_username,
                email=default_email,
                hashed_password=hashed,
                role="admin",
                status="active",
            )
            db.add(admin)
            db.commit()
            print(
                f"Default admin created. username={default_username} password={default_password}"
            )
    finally:
        db.close()

# -------------------- Root -----------------------
@app.get("/")
def root():
    return {"Backend is running 🚀"}

# -------------------- Auth Utilities -------------
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# -------------------- Verify Token ----------------
@app.get("/verify-token")
def verify_token(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id, "role": current_user.role}

# -------------------- Attendance All -------------
@app.get("/attendance/all")
def get_all_attendance(db: Session = Depends(get_db)):
    records = db.query(User).options(
        joinedload(User.attendances).joinedload(Attendance.course)
    ).all()
    attendance_list = []
    for user in records:
        if user.attendances:
            for att in user.attendances:
                attendance_list.append({
                    "student_name": user.full_name,
                    "username": user.username,
                    "course_name": att.course.name,
                    "date": str(att.date),
                    "status": att.status
                })
        else:
            attendance_list.append({
                "student_name": user.full_name,
                "username": user.username,
                "course_name": "-",
                "date": "-",
                "status": "absent"
            })
    return attendance_list

# -------------------- Include Routers ------------
# Pass current_user or current_admin dependencies in routers if needed
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(notices.router, prefix="/notices", tags=["Notices"])
app.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
