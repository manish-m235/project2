import React, { useEffect, useState } from 'react';

function HODApproval() {
  const [assignments, setAssignments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://localhost:8000/assignments/history/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments)
      .catch(err => console.error(err));
  }, [token]);

  const handleApproval = async (id, approve) => {
    const res = await fetch(`http://localhost:8000/assignments/approval/${id}?approved=${approve}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>📌 HOD Approval</h2>
      <ul>
        {assignments.map(a => (
          a.status === "graded" && (
            <li key={a.id}>
              <a href={`http://localhost:8000/${a.filepath}`} target="_blank" rel="noreferrer">{a.filename}</a>
              <p>Score: {a.score} | Comments: {a.comments}</p>
              <button onClick={() => handleApproval(a.id, true)}>Approve</button>
              <button onClick={() => handleApproval(a.id, false)}>Reject</button>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default HODApproval;
