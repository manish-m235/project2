import React, { useEffect, useState } from 'react';

function AssignmentHistory() {
  const [assignments, setAssignments] = useState([]);
  const student_id = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://localhost:8000/assignments/history/${student_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments)
      .catch(err => console.error(err));
  }, [student_id, token]);

  return (
    <div>
      <h2>📚 Assignment History</h2>
      <ul>
        {assignments.map(a => (
          <li key={a.id}>
            <a href={`http://localhost:8000/${a.filepath}`} target="_blank" rel="noreferrer">{a.filename}</a>
            <p>Status: {a.status} | Score: {a.score || "-"} | Comments: {a.comments || "-"}</p>
            <p>Uploaded at: {new Date(a.uploaded_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AssignmentHistory;
