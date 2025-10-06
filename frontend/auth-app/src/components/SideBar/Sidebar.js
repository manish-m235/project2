import React from "react";
import { FaBook, FaClipboardList, FaBell, FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FaUserGraduate className="sidebar-logo" />
          <h2>Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-btn" onClick={() => go("/dashboard")}>
            <FaBook /> Dashboard
          </button>

          <button className="nav-btn" onClick={() => go("/courses")}>
            <FaBook /> Courses
          </button>

          <button className="nav-btn" onClick={() => go("/attendance")}>
            <FaClipboardList /> Attendance
          </button>

          <button className="nav-btn" onClick={() => go("/assignments")}>
            <FaClipboardList /> Assignments
          </button>

          <button className="nav-btn" onClick={() => go("/notices")}>
            <FaBell /> Notices
          </button>
        </nav>
      </div>

      {/* Overlay (click to close) */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
}

export default Sidebar;
