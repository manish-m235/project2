import React, { useEffect, useState } from 'react';

function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/attendance/all') // You may need to create this endpoint
      .then(res => res.json())
      .then(setRecords)
      .catch(err => console.error('Error fetching attendance:', err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🕒 Attendance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Course ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.student_id}</td>
              <td>{r.course_id}</td>
              <td>{r.date}</td>
              <td>{r.status}</td>
              <td>{r.role || 'student'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Attendance;
