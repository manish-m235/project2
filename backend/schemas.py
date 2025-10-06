from pydantic import BaseModel, EmailStr
from datetime import date


# -------------------
# User Schemas
# -------------------
class UserCreate(BaseModel):
    full_name: str              # ✅ matches models.User
    username: str
    email: EmailStr
    password: str
    confirm_password: str       # ✅ added for validation
    role: str                   # student / teacher / admin

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    role: str
    status: str                 # ✅ added (important for "pending"/"active")
    
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


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    date: date
    status: str

    model_config = {"from_attributes": True}


# -------------------
# Assignment Schemas
# -------------------
class AssignmentCreate(BaseModel):
    student_id: int
    filename: str
    filepath: str
    content: str | None = None  # optional


class AssignmentOut(BaseModel):
    id: int
    student_id: int
    filename: str
    filepath: str
    content: str | None
    score: int | None
    comments: str | None
    status: str

    model_config = {"from_attributes": True}


# -------------------
# Notice Schemas
# -------------------
class NoticeCreate(BaseModel):
    title: str
    message: str


class NoticeOut(BaseModel):
    id: int
    title: str
    message: str
    posted_by: int

    model_config = {"from_attributes": True}
