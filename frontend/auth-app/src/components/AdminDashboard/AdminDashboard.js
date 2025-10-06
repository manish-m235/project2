// src/components/AdminDashboard/AdminDashboard.js
import React, { useState, useEffect } from "react";
import Sidebar from "../SideBar/Sidebar";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  // --------- Fetch Admin Info + Pending Users ---------
  useEffect(() => {
    if (!userId || role !== "admin") return;

    // Fetch admin details
    fetch(`http://localhost:8000/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin details");
        return res.json();
      })
      .then((data) => setAdminData(data))
      .catch((err) => {
        console.error(err);
        navigate("/"); // if something wrong, kick back to login
      });

    // Fetch pending users
    const fetchPending = async () => {
      try {
        const res = await fetch("http://localhost:8000/users/pending", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401 || res.status === 403) {
          alert("Session expired or unauthorized. Please login again.");
          navigate("/");
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingUsers(data);
          if (data.length > 0) setShowPopup(true);
        } else {
          setPendingUsers([]);
        }
      } catch (error) {
        console.error("Error fetching pending users:", error);
      }
    };

    fetchPending();
  }, [userId, role, token, navigate]);

  // --------- Handle Approval ---------
  const handleApproval = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8000/users/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Approval failed");
        return;
      }

      const data = await res.json();
      alert(data.message);

      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      if (pendingUsers.length - 1 <= 0) setShowPopup(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update user status");
    }
  };

  // --------- Logout ---------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <div
              className="hamburger"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? "✖" : "☰"}
            </div>
          </div>

          <div className="header-center">
            <div className="student-avatar">🛡️</div>
            <h1 className="portal-title">Admin Dashboard</h1>
          </div>

          <div className="header-right">
            <button
              className="notification-btn"
              onClick={() => setShowPopup(true)}
            >
              🔔{" "}
              {pendingUsers.length > 0 && (
                <span className="badge">{pendingUsers.length}</span>
              )}
            </button>
            {adminData && (
              <div className="user-info">
                <span className="user-role">{adminData.role}</span>
                <div className="user-details">
                  <span className="user-name">
                    {adminData.full_name || adminData.username}
                  </span>
                  <button className="logout-btn" onClick={handleLogout}>
                    ⏻ Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-body">
          <h2 className="portal-subtitle">
            Welcome, {adminData?.full_name || "Admin"}
          </h2>
        </div>

        {/* --------- Approval Popup --------- */}
        {showPopup && Array.isArray(pendingUsers) && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>🛎 New Registration Requests</h3>
              <ul>
                {pendingUsers.map((u) => (
                  <li key={u.id}>
                    {u.full_name} ({u.role})
                    <div>
                      <button onClick={() => handleApproval(u.id, "approve")}>
                        ✅ Approve
                      </button>
                      <button onClick={() => handleApproval(u.id, "reject")}>
                        ❌ Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
