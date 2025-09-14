import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // We'll add styling here

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      navigate('/');
    }
  };

  return (
    <div className="sidebar">
      <h3>Dashboard</h3>
      <ul>
        <li onClick={() => navigate('/dashboard')}>🏠 Home</li>
        {role === 'student' && <li onClick={() => navigate('/assignments/upload')}>📝 Upload Assignment</li>}
        {role === 'ta' && <li onClick={() => navigate('/assignments/ta-review')}>📝 TA Review</li>}
        {role === 'teacher' && <li onClick={() => navigate('/assignments/teacher-evaluate')}>📝 Teacher Evaluate</li>}
        {role === 'hod' && <li onClick={() => navigate('/assignments/hod-approval')}>📌 HOD Approval</li>}
        <li onClick={() => navigate('/assignments/history')}>📚 Assignment History</li>
        <li onClick={handleLogout}>🔒 Logout</li>
      </ul>
    </div>
  );
}

export default Sidebar;
