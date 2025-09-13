import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      try {
        const response = await fetch(`http://localhost:8000/verify-token/${token}`);
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

      {role === 'student' && (
        <ul>
          <li>📚 Enroll in courses</li>
          <li>📝 Submit assignments</li>
          <li>📊 View attendance/grades</li>
          <li>📅 Book resources</li>
        </ul>
      )}

      {role === 'ta' && (
        <ul>
          <li>📝 Review assignments</li>
          <li>✅ Assist in marking attendance</li>
          <li>💬 Provide feedback</li>
        </ul>
      )}

      {role === 'teacher' && (
        <ul>
          <li>📘 Create/manage courses</li>
          <li>🕒 Mark attendance</li>
          <li>🧮 Grade assignments</li>
          <li>✔️ Approve bookings</li>
        </ul>
      )}

      {role === 'hod' && (
        <ul>
          <li>📌 Finalize assignments</li>
          <li>📈 Oversee departmental analytics</li>
          <li>🚨 Manage escalations</li>
        </ul>
      )}

      {role === 'admin' && (
        <ul>
          <li>👥 Manage users</li>
          <li>🔐 Assign roles</li>
          <li>🛠️ Manage system-wide resources</li>
        </ul>
      )}
    </div>
  );
}

export default ProtectedPage;