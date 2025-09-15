import React, { useEffect, useState } from "react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!token || !userId) {
      console.error("No token or user ID found");
      setLoading(false);
      return;
    }

    // ✅ Fetch all courses
    fetch("http://localhost:8000/courses/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });

    // ✅ Fetch user enrolled courses
    fetch(`http://localhost:8000/attendance/student/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.enrolled_courses) {
          setEnrolledCourses(data.user.enrolled_courses.map((c) => c.id));
        }
      })
      .catch((err) => console.error("Error fetching enrollments:", err));
  }, [token, userId]);

  const handleEnroll = async (courseId) => {
    if (enrolledCourses.includes(courseId)) {
      alert("You are already enrolled in this course.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/enrollments/enroll/${courseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to enroll in course");
      }

      setEnrolledCourses([...enrolledCourses, courseId]);
      alert("Enrolled successfully!");
    } catch (err) {
      console.error(err);
      alert("Error enrolling in course");
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Available Courses</h2>

      {courses.length > 0 ? (
        <ul className="space-y-4">
          {courses.map((course) => (
            <li
              key={course.id}
              className="p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
              <div>
                {enrolledCourses.includes(course.id) ? (
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                    disabled
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Enroll
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
};

export default Courses;
