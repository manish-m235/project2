import React, { useState } from 'react';

function AssignmentUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const student_id = localStorage.getItem('user_id');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/assignments/upload/${student_id}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) setMessage(data.message);
      else setMessage(`❌ Failed to upload: ${data.detail || data.message}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to upload assignment");
    }
  };

  return (
    <div>
      <h2>📝 Submit Assignment</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AssignmentUpload;
