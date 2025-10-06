import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function AssignmentsDashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  // Fetch history
  const fetchHistory = useCallback(() => {
    if (!userId) return;
    fetch(`http://localhost:8000/assignments/history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setHistory(data) : setHistory([])))
      .catch((err) => console.error(err));
  }, [userId, token]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setMessage("Only JPG and PNG images are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/assignments/upload/${userId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.detail || "Upload failed");
        return;
      }
      setMessage("Assignment uploaded successfully");
      setFile(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setMessage("Upload failed: server error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="back-btn"
          style={{ padding: "8px 16px", backgroundColor: "#4a5568", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <h2>📝 Assignments</h2>
      <p style={{ color: "#555", marginTop: 4 }}>
        {role === "student" ? "Upload and track your assignments" : "Assignments overview"}
      </p>

      {role === "student" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <h3>Upload Assignment (JPG/PNG)</h3>
            <form onSubmit={handleUpload} style={{ marginTop: "0.75rem" }}>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setFile(e.target.files && e.target.files[0])}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#2b6cb0", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Upload</button>
              </div>
            </form>
            {message && <p style={{ marginTop: "0.5rem" }}>{message}</p>}
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <h3>My Submissions</h3>
            {history.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '8px' }}>
                {history.map((a) => (
                  <div key={a.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                    <div style={{ width: '100%', height: 100, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: 6 }}>
                      <img
                        src={`http://localhost:8000/${a.filepath}`}
                        alt={a.filename}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 12, color: '#444' }}>{a.filename}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Status: {a.status}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Score: {a.score ?? '-'}</div>
                      {a.comments && <div style={{ fontSize: 12, color: '#666' }}>Comments: {a.comments}</div>}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`http://localhost:8000/assignments/${a.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            if (res.status === 401 || res.status === 403) {
                              alert('Session expired or unauthorized. Please login again.');
                              localStorage.clear();
                              navigate('/');
                              return;
                            }
                            if (!res.ok) {
                              alert(data.detail || 'Failed to delete');
                              return;
                            }
                            fetchHistory();
                          } catch (err) {
                            console.error(err);
                            alert('Failed to delete');
                          }
                        }}
                        style={{ padding: '6px 10px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <p>Assignment review/evaluation dashboards are available in their respective sections (TA Reviews, Teacher Evaluate, HOD Approval).</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsDashboard;
