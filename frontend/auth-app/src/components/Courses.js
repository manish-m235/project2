import React, { useEffect, useState } from 'react';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      try {
        // Fetch all courses
        const courseRes = await fetch("http://localhost:8000/courses/");
        const courseData = await courseRes.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        // Fetch enrollments if student
        if (token && role === "student") {
          const enrollRes = await fetch("http://localhost:8000/enrollments/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const enrollData = await enrollRes.json();
          if (Array.isArray(enrollData)) {
            setEnrolledCourses(enrollData.map(e => e.course_id));
          } else {
            setEnrolledCourses([]);
          }
        }
      } catch (err) {
        console.error("Error loading courses or enrollments:", err);
      }
    };

    fetchCoursesAndEnrollments();
  }, [token, role]);

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:8000/enrollments/enroll/${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setEnrolledCourses(prev => [...prev, courseId]);
      } else {
        alert(data.detail || data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Something went wrong while enrolling");
    }
  };

  return (
    <div className="course-list" style={{ padding: "2rem" }}>
      <h2>📘 Courses</h2>
      {courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        courses.map(course => (
          <div key={course.id} className="course-box" style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: "#f3f4f6"
          }}>
            <h4>{course.name}</h4>
            <p>{course.description}</p>
            
            {role === "student" && (
              <button
                onClick={() => handleEnroll(course.id)}
                disabled={enrolledCourses.includes(course.id)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: enrolledCourses.includes(course.id) ? "not-allowed" : "pointer"
                }}
              >
                {enrolledCourses.includes(course.id) ? "✅ Enrolled" : "Enroll"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Courses;
