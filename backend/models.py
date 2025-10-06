from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Date, DateTime
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

# -------------------
# User Model
# -------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)   # keep NOT NULL
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="pending")  # "pending", "active", "rejected"

    courses = relationship("Course", back_populates="teacher", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="student", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="posted_by_user", cascade="all, delete-orphan")


# -------------------
# Course Model
# -------------------
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"))

    teacher = relationship("User", back_populates="courses")
    attendances = relationship("Attendance", back_populates="course", cascade="all, delete-orphan")


# -------------------
# Enrollment Model
# -------------------
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))


# -------------------
# Attendance Model
# -------------------
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

    student = relationship("User", back_populates="attendances")
    course = relationship("Course", back_populates="attendances")


# -------------------
# Assignment Model
# -------------------
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)   # ✅ added filename
    filepath = Column(String, nullable=False)   # ✅ store web path like 'uploads/..'
    content = Column(Text, nullable=True)       # optional (if storing plain text instead of file)
    score = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    status = Column(String, default="submitted")

    student = relationship("User", back_populates="assignments")


# -------------------
# Notice Model
# -------------------
class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    posted_by = Column(Integer, ForeignKey("users.id"))

    posted_by_user = relationship("User", back_populates="notices")
