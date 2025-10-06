import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/courses/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { setCourses(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    fetch(`http://localhost:8000/enrollments/student/${userId}`)
      .then(res => res.json())
      .then(data => { if (data.course_id) setEnrolledCourses([data.course_id]); })
      .catch(err => console.error(err));
  }, [token, userId]);

  const handleEnroll = async (courseId) => {
    try {
      const student_id = localStorage.getItem("user_id");

      const response = await fetch(
        `http://localhost:8000/enrollments/enroll/${courseId}?student_id=${student_id}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to enroll");
      }

      const data = await response.json();
      alert(data.message || "Enrolled successfully!");
      setEnrolledCourses([courseId]);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: '1rem', padding: '8px 16px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Available Courses</h2>

      {courses.length > 0 ? (
        <ul className="space-y-4">
          {courses.map(course => (
            <li key={course.id} className="p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
              <div>
                {enrolledCourses.includes(course.id) ? (
                  <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                    Already Enrolled
                  </button>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Enroll
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (<p>No courses available.</p>)}
    </div>
  );
};

export default Courses;
