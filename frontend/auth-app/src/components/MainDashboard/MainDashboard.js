import React, { useState, useEffect } from "react";
import Sidebar from "../SideBar/Sidebar";
import { useNavigate } from "react-router-dom";
import "./MainDashboard.css";

function MainDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [notices, setNotices] = useState([]);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user_id) return;

    // Fetch user data
    fetch(`http://localhost:8000/users/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(console.error);

    // Fetch enrolled course
    fetch(`http://localhost:8000/enrollments/student/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEnrolledCourse(data))
      .catch(console.error);

    // Fetch notices
    fetch("http://localhost:8000/notices", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(console.error);

  }, [user_id, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  return (
    <div className="main-dashboard">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="hamburger" onClick={() => setSidebarOpen(prev => !prev)}>
              {sidebarOpen ? "✖" : "☰"}
            </div>
          </div>

          <div className="header-center">
            <div className="student-avatar">👨‍🎓</div>
            <h1 className="portal-title">Student Portal</h1>
          </div>

          <div className="header-right">
            {userData && (
              <div className="user-info">
                <span className="user-role">{userData.role || role}</span>
                <div className="user-details">
                  <span className="username">{userData.full_name || userData.username}</span>
                  <button className="logout-btn" onClick={handleLogout}>⏻ Logout</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-body">
          <h2 className="portal-subtitle">Welcome to the Student Portal</h2>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-box half-box">
            <h3>📘 Enrolled Course</h3>
            {enrolledCourse ? (
              <>
                <p><strong>{enrolledCourse.course_name}</strong></p>
                <p>{enrolledCourse.course_description}</p>
              </>
            ) : <p>No course enrolled yet.</p>}
          </div>

          <div className="dashboard-box half-box">
            <h3>📢 Notices</h3>
            <div className="notice-list">
              {notices.length > 0 ? (
                notices.map((n, i) => (
                  <div key={i} className="notice-item">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>— {n.posted_by}</small>
                  </div>
                ))
              ) : <p>No notices available</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
