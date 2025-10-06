import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./Login";
import Register from "./Register";

// Dashboards
import MainDashboard from "./components/MainDashboard/MainDashboard";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

// Other components
import Courses from "./components/Elements/Courses";
import AssignmentsDashboard from "./components/Assignments/AssignmentsDashboard";
import NoticeBoard from "./components/Elements/NoticeBoard";
import Attendance from "./components/Elements/Attendance";

import "./index.css";

// ----------------- Protected Route -----------------
const ProtectedRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />; // not logged in
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />; // wrong role

  return element;
};

// ----------------- App Rendering -----------------
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<MainDashboard />} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
        />

        {/* Shared Components */}
        <Route path="/courses" element={<ProtectedRoute element={<Courses />} />} />
        <Route path="/assignments" element={<ProtectedRoute element={<AssignmentsDashboard />} />} />
        <Route path="/notices" element={<ProtectedRoute element={<NoticeBoard />} />} />
        <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
