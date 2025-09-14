import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // ✅ import sidebar
import './MainDashboard.css';

function MainDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const user_id = localStorage.getItem('user_id');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user_id) {
      fetch(`http://localhost:8000/attendance/student/${user_id}`)
        .then(res => res.json())
        .then(setUserData)
        .catch(err => {
          console.error("Error fetching attendance data:", err);
          setUserData(null);
        });
    }
  }, [user_id]);

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-grid" style={{ flex: 1 }}>
        {userData && (
          <div className="dashboard-box">
            <h3>🕒 Attendance Summary</h3>
            <p><strong>Username:</strong> {userData.user.username}</p>
            <p><strong>Role:</strong> {userData.user.role}</p>
            <p>
              <strong>Enrolled Courses:</strong>{" "}
              {userData.user.enrolled_courses.length > 0
                ? userData.user.enrolled_courses.map(c => c.name).join(", ")
                : "None"}
            </p>
            <h4>📅 History:</h4>
            {userData.attendance.length > 0 ? (
              <ul style={{ maxHeight: '200px', overflowY: 'auto', paddingLeft: '1rem' }}>
                {userData.attendance.map((record, index) => (
                  <li key={index}>
                    {record.date}: <strong>{record.status}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No attendance records found.</p>
            )}
          </div>
        )}

        <div className="dashboard-box" onClick={() => navigate('/courses')}>
          <h3>📘 Courses</h3>
          <p>View all available courses</p>
        </div>

        <div className="dashboard-box" onClick={() => navigate('/assignments')}>
          <h3>📝 Assignments</h3>
          {role === 'student' ? (
            <p>Submit your assignments</p>
          ) : (
            <p>Review and grade student submissions</p>
          )}
        </div>

        <div className="dashboard-box" onClick={() => navigate('/notices')}>
          <h3>📣 Notice Board</h3>
          {role === 'student' ? (
            <p>View exam dates, schedules, and updates</p>
          ) : (
            <p>Post notices for students</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
