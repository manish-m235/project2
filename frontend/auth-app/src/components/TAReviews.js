import React, { useEffect, useState } from 'react';

function TAReviews() {
  const [assignments, setAssignments] = useState([]);
  const [comments, setComments] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://localhost:8000/assignments/history/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments)
      .catch(err => console.error(err));
  }, [token]);

  const handleReview = async (id) => {
    if (!comments[id]) return alert("Enter comments");

    const res = await fetch(`http://localhost:8000/assignments/review/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ comments: comments[id] })
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>📝 TA Review</h2>
      <ul>
        {assignments.map(a => (
          a.status === "submitted" && (
            <li key={a.id}>
              <a href={`http://localhost:8000/${a.filepath}`} target="_blank" rel="noreferrer">{a.filename}</a>
              <input
                type="text"
                placeholder="Add comments"
                value={comments[a.id] || ""}
                onChange={(e) => setComments({...comments, [a.id]: e.target.value})}
              />
              <button onClick={() => handleReview(a.id)}>Review</button>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default TAReviews;
