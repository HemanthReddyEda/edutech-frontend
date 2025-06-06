import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';

const ViewReports = () => {
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    section: '',
    date: ''
  });

  const [adminData, setAdminData] = useState({});
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://backend-production-6281.up.railway.app/api/student-dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin info');
      }
    };
    fetchAdmin();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://backend-production-6281.up.railway.app/api/admin/view-reports',
        filters,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(res.data || []);
      setMessage(`✅ ${res.data.length} record(s) found.`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to fetch reports.');
      setMessage('');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, 'StudentTestReports.xlsx');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    navigate('/');
  };

  const initials = adminData?.name
    ? adminData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'AD';

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <header className="page-header">
    <img src="https://www.careerit.co.in/wp-content/uploads/2023/05/logo-careerit.png" alt="mru-Logo" className="logo" />
        {/* <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdco6M6q4z__MjhtqnC3WUVzQ2hgFzk1kDDg&s" alt="excelr-Logo" className="logo" /> */}
        <div className="profile-section">
          <div className="profile-avatar">{initials}</div>
          <span className="profile-name">{adminData?.name || 'Admin'}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '10px' }}>
        <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>🔍 Filter Reports</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {['department', 'year', 'section'].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={`Enter ${field}`}
                onChange={handleChange}
                style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
              />
            ))}
            <input
              type="date"
              name="date"
              onChange={handleChange}
              style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
            <button
              onClick={fetchReports}
              style={{ padding: '10px 18px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Get Reports
            </button>
          </div>
          {message && <div style={{ color: 'green', marginTop: '15px' }}>{message}</div>}
          {error && <div style={{ color: 'red', marginTop: '15px' }}>{error}</div>}
        </section>

        {reports.length > 0 && (
          <section style={{ background: '#fff', marginTop: '30px', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>📋 Student Test Results</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#1976d2', color: '#fff' }}>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Roll No</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={tdStyle}>{r.rollNo}</td>
                      <td style={tdStyle}>{r.date}</td>
                      <td style={tdStyle}>{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={exportToExcel}
              style={{ marginTop: '20px', backgroundColor: '#388e3c', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              📥 Download Excel
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

export default ViewReports;
