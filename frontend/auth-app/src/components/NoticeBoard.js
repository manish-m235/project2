import React, { useEffect, useState } from 'react';

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
      });

      const data = await res.json();
      if (res.ok) {
        setResponse("✅ Notice posted");
        setNotices(prev => [{ title, message, posted_by: "You" }, ...prev]);
        setTitle('');
        setMessage('');
      } else {
        const errorMessage = typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data);
        setResponse(`❌ ${errorMessage}`);
      }
    } catch (err) {
      setResponse("❌ Failed to post notice");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📣 Notice Board</h2>

      {role !== "student" && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit">Post Notice</button>
          {response && <p>{response}</p>}
        </form>
      )}

      <ul style={{ paddingLeft: '1rem' }}>
        {notices.map((n, i) => (
          <li key={i}>
            <strong>{n.title}</strong> — {n.message} <em>({n.posted_by})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoticeBoard;
