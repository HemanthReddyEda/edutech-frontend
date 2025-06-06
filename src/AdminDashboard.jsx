import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(
          'https://backend-production-6281.up.railway.app/api/student-dashboard',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const data = response.data;
        if (data.role !== 'admin') {
          setError('❌ Access denied. You are not an admin.');
        } else {
          setAdminData(data);
        }
      } catch (err) {
        setError('❌ Unauthorized access or failed to fetch admin data.');
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleResetTest = async () => {
    const rollNumber = prompt("Enter student roll number to reset today's test:");
    if (!rollNumber) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://backend-production-6281.up.railway.app/api/admin/reset-test",
        { studentId: rollNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(response.data.message || "✅ Test reset successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to reset test.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    navigate('/');
  };

  if (error) {
    return <div className="error-message" style={{ marginTop: '120px' }}>{error}</div>;
  }

  if (!adminData) {
    return <div className="exam-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <>
      <div className="dashboard-container">
        <header className="page-header">
          <img src="https://www.careerit.co.in/wp-content/uploads/2023/05/logo-careerit.png" alt="mru-Logo" className="logo" />
          <div className="profile-section">
            <div className="profile-avatar">
              {adminData.name ? adminData.name.split(' ').map(word => word[0]).join('').toUpperCase() : 'AD'}
            </div>
            <span className="profile-name">{adminData.name || 'Admin'}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div style={{
          maxWidth: '800px',
          margin: '30px auto',
          padding: '30px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1976d2', marginBottom: '20px' }}>📊 Admin Dashboard</h2>
          <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
            <p><strong>Email:</strong> {adminData.email}</p>
            <p><strong>Role:</strong> {adminData.role}</p>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={() => navigate('/admin/manage-questions')}
              style={{
                padding: '12px',
                backgroundColor: '#1976d2',
                color: 'white',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📋 Manage Questions
            </button>

            <button
              onClick={() => navigate('/admin/reports')}
              style={{
                padding: '12px',
                backgroundColor: '#388e3c',
                color: 'white',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📊 View Reports
            </button>

            {/* <button
              onClick={() => navigate('/admin/add-coding-question')}
              style={{
                padding: '12px',
                backgroundColor: '#6a1b9a',
                color: 'white',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🧠 Add Coding Question
            </button> */}

            <button
  onClick={() => navigate('/admin/reset-students')}
  style={{
    padding: '12px',
    backgroundColor: '#f57c00',
    color: 'white',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  }}
>
  🔄 Reset Today’s Test for Students
</button>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;