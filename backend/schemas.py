from pydantic import BaseModel
from datetime import date

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    model_config = {"from_attributes": True}

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

class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: str

class AssignmentCreate(BaseModel):
    student_id: int
    content: str

class NoticeCreate(BaseModel):
    title: str
    message: str
