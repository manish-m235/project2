import React, { useState } from 'react';

function AssignmentUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const student_id = localStorage.getItem('user_id');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/assignments/upload/${student_id}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || 'Upload complete');
    } catch (err) {
      console.error(err);
      setMessage('Upload failed');
    }
  };

  return (
    <div className="upload-container" style={{ padding: '2rem' }}>
      <h2>📝 Submit Assignment</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AssignmentUpload;
