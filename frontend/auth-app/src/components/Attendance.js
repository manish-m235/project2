import React, { useEffect, useState } from "react";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      console.error("No token or user ID found");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/attendance/student/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch attendance");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setAttendance(data.attendance);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10 text-red-500">No user data available.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Attendance Summary</h2>

      {/* ✅ User Info */}
      <div className="mb-6">
        <p className="text-lg font-semibold">
          User: <span className="text-gray-700">{user.username}</span>
        </p>
        <p className="text-md">
          Role: <span className="text-gray-700">{user.role}</span>
        </p>

        {/* ✅ Enrolled Courses */}
        <div className="mt-4">
          <h3 className="font-semibold">Enrolled Course:</h3>
          {user.enrolled_courses && user.enrolled_courses.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-700">
              {user.enrolled_courses.map((course) => (
                <li key={course.id}>{course.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">Not enrolled in any course</p>
          )}
        </div>
      </div>

      {/* ✅ Attendance History */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Attendance History</h3>
        {attendance.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{record.date}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      record.status === "present" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance records found.</p>
        )}
      </div>
    </div>
  );
};

export default Attendance;
