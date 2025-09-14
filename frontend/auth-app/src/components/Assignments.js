import React, { useEffect, useState } from 'react';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState('');
  const [score, setScore] = useState('');
  const role = localStorage.getItem('role');
  const user_id = localStorage.getItem('user_id');

  useEffect(() => {
    fetch('http://localhost:8000/assignments/')
      .then(res => res.json())
      .then(setAssignments)
      .catch(err => console.error(err));
  }, []);

  const submitAssignment = async () => {
    await fetch('http://localhost:8000/assignments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user_id, content: newAssignment }),
    });
    alert('Assignment submitted');
  };

  const gradeAssignment = async (id) => {
    await fetch(`http://localhost:8000/assignments/${id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });
    alert('Grade submitted');
  };

  const getLabel = (score) => {
    if (score === 10) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 6) return 'Good';
    return 'Bad';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📝 Assignments</h2>
      {role === 'student' ? (
        <>
          <textarea
            placeholder="Write your assignment..."
            value={newAssignment}
            onChange={(e) => setNewAssignment(e.target.value)}
          />
          <button onClick={submitAssignment}>Submit</button>
        </>
      ) : (
        <ul>
          {assignments.map(a => (
            <li key={a.id}>
              <p><strong>Student {a.student_id}</strong>: {a.content}</p>
              {a.score ? (
                <p>Score: {a.score} — {getLabel(a.score)}</p>
              ) : (
                <>
                  <input type="number" placeholder="Score out of 10" onChange={e => setScore(e.target.value)} />
                  <button onClick={() => gradeAssignment(a.id)}>Grade</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Assignments;
