from pydantic import BaseModel, EmailStr
from datetime import date


# -------------------
# User Schemas
# -------------------
class UserCreate(BaseModel):
    full_name: str              # ✅ added
    username: str
    email: EmailStr
    password: str
    confirm_password: str       # ✅ added
    role: str  # student / teacher / admin

class UserLogin(BaseModel):
    username_or_email: str
    password: str
    
class UserOut(BaseModel):
    id: int
    full_name: str              # ✅ added
    username: str
    email: EmailStr
    role: str
    model_config = {"from_attributes": True}
# -------------------
# Course Schemas
# -------------------
class CourseCreate(BaseModel):
    name: str
    description: str
    teacher_id: int


class CourseOut(BaseModel):
    id: int
    name: str
    description: str
    teacher_id: int

    model_config = {"from_attributes": True}


# -------------------
# Attendance Schemas
# -------------------
class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: str  # Present / Absent / Enrolled


# -------------------
# Assignment Schemas
# -------------------
class AssignmentCreate(BaseModel):
    student_id: int
    filename: str
    filepath: str
    content: str | None = None  # optional, in case you also allow text-based submission


# -------------------
# Notice Schemas
# -------------------
class NoticeCreate(BaseModel):
    title: str
    message: str
