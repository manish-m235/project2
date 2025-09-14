import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MainDashboard from './components/MainDashboard';
import Courses from './components/Courses';
import AssignmentUpload from './components/AssignmentUpload';
import NoticeBoard from './components/NoticeBoard';
import Attendance from './components/Attendance';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<MainDashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/assignments" element={<AssignmentUpload />} />
      <Route path="/notices" element={<NoticeBoard />} />
      <Route path="/attendance" element={<Attendance />} />
    </Routes>
  </BrowserRouter>
);
