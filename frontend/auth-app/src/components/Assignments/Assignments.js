import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState('');
  const [score, setScore] = useState('');
  const role = localStorage.getItem('role');
  const user_id = localStorage.getItem('user_id');

  const navigate = useNavigate();

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
      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: '1rem', padding: '8px 16px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      <h2>📝 Assignments</h2>
      {role === 'student' ? (
        <>
          <textarea placeholder="Write your assignment..." value={newAssignment} onChange={(e) => setNewAssignment(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }} />
          <button onClick={submitAssignment} style={{ padding: '0.5rem 1rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px' }}>Submit</button>
        </>
      ) : (
        <ul style={{ paddingLeft: '1rem', marginTop: '1rem' }}>
          {assignments.map(a => (
            <li key={a.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '5px' }}>
              <p><strong>Student {a.student_id}</strong>: {a.content}</p>
              {a.score ? <p>Score: {a.score} — {getLabel(a.score)}</p> :
                <>
                  <input type="number" placeholder="Score out of 10" onChange={e => setScore(e.target.value)} style={{ marginRight: '0.5rem', padding: '0.3rem' }} />
                  <button onClick={() => gradeAssignment(a.id)} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px' }}>Grade</button>
                </>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Assignments;
