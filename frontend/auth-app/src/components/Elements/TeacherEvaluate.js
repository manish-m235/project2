import React, { useEffect, useState } from 'react';

function TeacherEvaluate() {
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState({});
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

  const handleGrade = async (id) => {
    if (!scores[id]) return alert("Enter a score");

    const res = await fetch(`http://localhost:8000/assignments/evaluate/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ score: parseFloat(scores[id]), comments: comments[id] })
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>📝 Teacher Evaluation</h2>
      <ul>
        {assignments.map(a => (
          a.status === "reviewed" && (
            <li key={a.id}>
              <a href={`http://localhost:8000/${a.filepath}`} target="_blank" rel="noreferrer">{a.filename}</a>
              <input type="number" placeholder="Score" value={scores[a.id] || ""} onChange={(e) => setScores({...scores, [a.id]: e.target.value})}/>
              <input type="text" placeholder="Comments" value={comments[a.id] || ""} onChange={(e) => setComments({...comments, [a.id]: e.target.value})}/>
              <button onClick={() => handleGrade(a.id)}>Submit Grade</button>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default TeacherEvaluate;
