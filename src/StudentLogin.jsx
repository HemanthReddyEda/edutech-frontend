import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentLogin.css';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Step 1: Login
    const response = await axios.post('https://backend-production-6281.up.railway.app/api/login', formData);
    const { token, message, student } = response.data; // ✅ extract student

    // Step 2: Save token
    localStorage.setItem('token', token);
    setMessage(message);
    setError('');

    // Step 3: Role-based redirection
    if (student.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      // Step 4: Fetch student dashboard data
      const dashboardResponse = await axios.get('https://backend-production-6281.up.railway.app/api/student-dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Step 5: Save student ID (or other data)
      localStorage.setItem('studentId', dashboardResponse.data.studentId);

      // Step 6: Navigate to student dashboard
      navigate('/student-dashboard');
    }

  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
    setMessage('');
  }
};


  return (
    <div className="page-container">
  <header className="page-header">
    <img
      src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj0UIXPa0oNYdYUFo3MFqCo7VGEvUr7klAELrXUdknxLrkZTbsBlKy5a1FxRX5eUJF4dBmbSzxYH0pNERNCUanZ-2QJyT1afuvUEwftM5w2qwP6p8vK1gazKvW_xY0z4u8KNS_9JS2ht3E/s430/Malla+Reddy+University+logo.png'
      alt="mru-Logo"
      className="logo"
    />
    <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdco6M6q4z__MjhtqnC3WUVzQ2hgFzk1kDDg&s' alt="excelr-logo"
        className="logo"
    />
  </header>

  <div className="login-container">
    <h2>Student Login</h2>
    {message && <div className="success-message">{message}</div>}
    {error && <div className="error-message">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Roll Number</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>
      <button type="submit" className="btn-login">Login</button>
    </form>
  </div>
</div>

  );
};

export default StudentLogin;