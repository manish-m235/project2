import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/notices")
      .then(res => res.json())
      .then(setNotices)
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, message })
      });

      const data = await res.json();
      if (res.ok) {
        setResponse("✅ Notice posted");
        setNotices(prev => [{ title, message, posted_by: "You" }, ...prev]);
        setTitle(''); setMessage('');
      } else {
        const errorMessage = typeof data.detail === "string" ? data.detail : JSON.stringify(data);
        setResponse(`❌ ${errorMessage}`);
      }
    } catch (err) {
      setResponse("❌ Failed to post notice");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: '1rem', padding: '8px 16px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>← Back to Dashboard</button>

      <h2>📣 Notice Board</h2>

      {role !== "student" && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: 'block', marginBottom: '0.5rem', width: '100%', padding: '0.5rem' }} />
          <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required style={{ display: 'block', marginBottom: '0.5rem', width: '100%', padding: '0.5rem' }} />
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px' }}>Post Notice</button>
          {response && <p>{response}</p>}
        </form>
      )}

      <ul style={{ paddingLeft: '1rem' }}>
  {notices.map((n, i) => (
    <li key={i} style={{ marginBottom: "1rem" }}>
      <strong>{n.title}</strong> — {n.message} <em>({n.posted_by})</em>

      {role !== "student" && (
        <button
          onClick={async () => {
            try {
              const res = await fetch(`http://localhost:8000/notices/${n.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                setNotices(prev => prev.filter((_, idx) => idx !== i));
              } else {
                const err = await res.json();
                alert("❌ " + (err.detail || "Failed to delete"));
              }
            } catch (err) {
              alert("❌ Error deleting notice");
              console.error(err);
            }
          }}
          style={{
            marginLeft: "10px",
            padding: "4px 10px",
            backgroundColor: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}
        >
          Delete
        </button>
      )}
    </li>
  ))}
</ul>
    </div>
  );
}

export default NoticeBoard;
