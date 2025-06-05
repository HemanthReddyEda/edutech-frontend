import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const ResetStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          'https://backend-production-6281.up.railway.app/api/admin/all-students',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudents(res.data);
      } catch (err) {
        alert('❌ Failed to fetch students');
      }
    };
    fetchStudents();
  }, []);

  const handleReset = async (studentId) => {
    const confirm = window.confirm(`Are you sure you want to reset today's test for this student?`);
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://backend-production-6281.up.railway.app/api/admin/reset-test",
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "✅ Test reset successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to reset test.");
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <header className="page-header">
        <img
          src="https://www.careerit.co.in/wp-content/uploads/2023/05/logo-careerit.png"
          alt="careerit-logo"
          className="logo"
        />
        <div className="profile-section">
          <div className="profile-avatar">AD</div>
          <span className="profile-name">Admin</span>
          <button className="logout-button" onClick={() => navigate('/')}>Logout</button>
        </div>
      </header>

      <div style={{
        backgroundColor: '#ffffff',
        maxWidth: '1000px',
        margin: '60px auto',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#1976d2', margin: 0 }}>🔄 Reset Today’s Test - All Students</h2>
          <button
            onClick={() => navigate('/admin-dashboard')}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              padding: '8px 14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '20px'
          }}
        />

        <div style={{ overflowX: 'auto' }}>
          <table className="questions-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead style={{ backgroundColor: '#f1f1f1' }}>
              <tr>
                <th style={thStyle}>Roll Number</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Reset</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                students
                  .filter(s =>
                    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((student, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={tdStyle}>{student.rollNumber}</td>
                      <td style={tdStyle}>{student.name}</td>
                      <td style={tdStyle}>{student.email}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleReset(student._id)}  // ✅ send studentId
                          style={{
                            backgroundColor: '#f57c00',
                            color: 'white',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: '0.3s'
                          }}
                          onMouseOver={(e) => e.target.style.opacity = 0.8}
                          onMouseOut={(e) => e.target.style.opacity = 1}
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '12px',
  fontSize: '1rem',
  color: '#333',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '10px',
  fontSize: '0.95rem',
  color: '#555'
};

export default ResetStudentsPage;
