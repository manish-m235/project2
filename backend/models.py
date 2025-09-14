from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Date, DateTime
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, nullable=False)  # student, ta, teacher, hod, admin

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    teacher_id = Column(Integer)

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    course_id = Column(Integer)
    date = Column(Date)
    status = Column(String)

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    filename = Column(String)
    filepath = Column(String)
    score = Column(Float, nullable=True)
    comments = Column(Text, nullable=True)
    status = Column(String, default="submitted")  # submitted, reviewed, graded, approved
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    posted_by = Column(String, nullable=False)
