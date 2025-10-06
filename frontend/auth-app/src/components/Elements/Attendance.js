import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Attendance.css";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  // ---------------- Fetch Attendance ----------------
  const fetchAttendance = () => {
    fetch(`http://localhost:8000/attendance/student/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setAttendance(data.attendance);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchAttendance(); }, []);

  const createAttendance = (courseId, status) => {
    fetch("http://localhost:8000/attendance/mark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ student_id: userId, course_id: courseId, status }),
    })
      .then(() => fetchAttendance())
      .catch(err => console.error(err));
  };

  const updateAttendance = (attendanceId, status) => {
    fetch(`http://localhost:8000/attendance/update/${attendanceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then(() => fetchAttendance())
      .catch(err => console.error(err));
  };

  const handleMark = (record, status) => {
    if (record.id) updateAttendance(record.id, status);
    else createAttendance(record.course_id, status);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="attendance-container">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <h2 className="attendance-title">Attendance Records</h2>

      {attendance.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records</p>
      ) : (
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID No</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, idx) => {
                const rowClass =
                  record.status === "present"
                    ? "present"
                    : record.status === "absent"
                    ? "absent"
                    : idx % 2 === 0
                    ? ""
                    : "";

                return (
                  <tr key={record.course_id} className={rowClass}>
                    <td>{record.student_id}</td>
                    <td>{record.student_name}</td>
                    <td>{record.course_name}</td>
                    <td>{record.date}</td>
                    <td className={
                      record.status === "present"
                        ? "status-present"
                        : record.status === "absent"
                        ? "status-absent"
                        : "status-none"
                    }>
                      {record.status === "none"
                        ? "Not Marked"
                        : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </td>
                    <td>
                      <button
                        className="present-btn"
                        disabled={record.status === "present"}
                        onClick={() => handleMark(record, "present")}
                      >
                        Present
                      </button>
                      <button
                        className="absent-btn"
                        disabled={record.status === "absent"}
                        onClick={() => handleMark(record, "absent")}
                      >
                        Absent
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
