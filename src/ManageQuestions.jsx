import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    companyId: '',
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
  });
  const [excelFile, setExcelFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminName();
    fetchQuestions();
    fetchCompanies();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('https://backend-production-6281.up.railway.app/api/mcqs');
      setQuestions(response.data);
    } catch (err) {
      setError('Failed to fetch questions');
    }
  };

  const fetchCompanies = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      'https://backend-production-6281.up.railway.app/api/companies',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCompanies(res.data);
  } catch (err) {
    console.error('Failed to fetch companies');
  }
};


  const fetchAdminName = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://backend-production-6281.up.railway.app/api/student-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.role !== 'admin') {
        setError('❌ Access denied. You are not an admin.');
      } else {
        setAdminName(res.data.name || 'Admin');
      }
    } catch (err) {
      setError('❌ Unauthorized access or failed to fetch admin data.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = Number(name.split('option')[1]);
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://backend-production-6281.up.railway.app/api/mcqs', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setError('');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload question');
      setMessage('');
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) return;

    const data = new FormData();
    data.append('file', excelFile);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://backend-production-6281.up.railway.app/api/mcqs/upload-excel', data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setError('');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Excel upload failed');
      setMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    navigate('/');
  };

  const initials = adminName ? adminName.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD';

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <img src="https://www.careerit.co.in/wp-content/uploads/2023/05/logo-careerit.png" alt="mru-Logo" className="logo" />
        <div className="profile-section">
          <div className="profile-avatar">{initials}</div>
          <span className="profile-name">{adminName}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ margin: '20px auto', padding: '20px', maxWidth: '700px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ color: '#1976d2' }}>📋 Manage Questions</h2>

        <h3>Add Single MCQ</h3>
        <form
          onSubmit={handleAddQuestion}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          }}
        >
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          >
            <option value="">-- Select Company --</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>

          <input
            name="subject"
            placeholder="Subject"
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
          <input
            name="question"
            placeholder="Question"
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />

          {formData.options.map((opt, i) => (
            <input
              key={i}
              name={`option${i}`}
              placeholder={`Option ${i + 1}`}
              onChange={handleInputChange}
              required
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          ))}

          <input
            type="number"
            name="correctAnswerIndex"
            placeholder="Correct Option Index (0-3)"
            min="0"
            max="3"
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              padding: '12px',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#145ea8')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#1976d2')}
          >
            ➕ Add Question
          </button>
        </form>

        <h3 style={{ marginTop: '30px' }}>📂 Upload from Excel</h3>
        <form onSubmit={handleExcelUpload} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setExcelFile(e.target.files[0])} required />
          <button type="submit" style={{ backgroundColor: '#388e3c', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px' }}>Upload Excel</button>
        </form>

        {message && <div style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>

      <div style={{ margin: '20px auto', padding: '20px', maxWidth: '90%', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>🧾 All MCQ Questions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Subject</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Question</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Options</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{q.subject}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{q.question}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{q.options.join(', ')}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{q.options[q.correctAnswerIndex]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageQuestions;
