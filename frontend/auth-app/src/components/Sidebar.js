import React from "react";
import { useNavigate } from "react-router-dom";
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      navigate("/"); // redirect to login
    }
  };

  return (
    <div className="sidebar">
      <h2>Academic Portal</h2>
      <ul>
        <li onClick={() => navigate("/dashboard")}>🏠 Dashboard</li>
        <li onClick={() => navigate("/courses")}>📘 Courses</li>
        <li onClick={() => navigate("/assignments")}>📝 Assignments</li>
        <li onClick={() => navigate("/attendance")}>🕒 Attendance</li>
        <li onClick={() => navigate("/notices")}>📣 Notices</li>
      </ul>

      <div className="logout-icon" onClick={handleLogout} title="Logout">
        🔌
      </div>
    </div>
  );
}

export default Sidebar;
