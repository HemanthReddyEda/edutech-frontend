import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboard.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [summaryData, setSummaryData] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://backend-production-6281.up.railway.app/api/student-dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentData(res.data);
        fetchResultSummary();
        checkTodaySubmission();
      } catch (err) {
        setError('Failed to fetch student data. Please login again.');
      }
    };
    fetchStudent();
  }, []);

  const checkTodaySubmission = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://backend-production-6281.up.railway.app/api/student/results', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const today = new Date().toISOString().slice(0, 10);
      const submitted = res.data.some(entry => entry.date.startsWith(today));
      setAlreadySubmitted(submitted);
    } catch (err) {
      console.error('Failed to check submission:', err);
    }
  };

  const fetchResultSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://backend-production-6281.up.railway.app/api/student/result-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummaryData(res.data);
      setShowSummary(true);
    } catch (err) {
      console.error("Failed to load summary");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('savedAnswers');
    navigate('/');
  };

  const handleStartMCQTest = () => {
    if (alreadySubmitted) {
      setShowSubmissionModal(true);
    } else {
      setShowInstructions(true);
    }
  };

  const handleConfirmStart = () => {
    navigate('/exam');
  };

  const initials = studentData?.name ? studentData.name[0].toUpperCase() : '?';
  const averageScore = summaryData.reduce((sum, r) => sum + r.score, 0) / (summaryData.length || 1);

  const scoreData = {
    labels: summaryData.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Score over time',
        data: summaryData.map(r => r.score),
        fill: false,
        backgroundColor: '#0984e3',
        borderColor: '#0984e3',
      }
    ]
  };

  if (error) return <div className="dashboard-container"><div className="error-message">{error}</div></div>;
  if (!studentData) return <div className="dashboard-container"><p>Loading student data...</p></div>;

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj0UIXPa0oNYdYUFo3MFqCo7VGEvUr7klAELrXUdknxLrkZTbsBlKy5a1FxRX5eUJF4dBmbSzxYH0pNERNCUanZ-2QJyT1afuvUEwftM5w2qwP6p8vK1gazKvW_xY0z4u8KNS_9JS2ht3E/s430/Malla+Reddy+University+logo.png" alt="mru-Logo" className="logo" />
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdco6M6q4z__MjhtqnC3WUVzQ2hgFzk1kDDg&s" alt="excelr-Logo" className="logo" />
        <div className="profile-section">
          <div className="profile-avatar">{initials}</div>
          <span className="profile-name">{studentData.name}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showInstructions && (
        <div className="instructions-overlay">
          <div className="instructions-modal">
            <h3>Test Instructions</h3>
            <div className="greeting">Hello {studentData.name}, please read the instructions below</div>
            <ul>
              <li>✅ Total Questions: 25</li>
              <li>⏰ Duration: 60 minutes</li>
              <li>✅ Each correct answer = +1 mark</li>
              <li>⚠️ No negative marking</li>
              <li>🔐 One attempt per day allowed</li>
            </ul>
            <div className="instructions-buttons">
              <button onClick={() => setShowInstructions(false)}>Cancel</button>
              <button onClick={handleConfirmStart}>Start Test</button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="instructions-overlay">
          <div className="instructions-modal">
            <h3>❌ Test Already Submitted</h3>
            <p>You have already submitted the test for today. Please come back tomorrow.</p>
            <div className="instructions-buttons">
              <button onClick={() => setShowSubmissionModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="dashboard-heading">Welcome, {studentData.name}</h2>
      <div className="dashboard-flex">
        <div className="dashboard-card">
          <p><strong>Roll Number:</strong> {studentData.rollNo}</p>
          <p><strong>Email:</strong> {studentData.email}</p>
          <p><strong>Branch:</strong> {studentData?.sectionId?.yearId?.departmentId?.name || 'N/A'}</p>
          <p><strong>Academic Year:</strong> {studentData?.sectionId?.yearId?.name || 'N/A'}</p>
          <p><strong>Section:</strong> {studentData?.sectionId?.name || 'N/A'}</p>
          <p><strong>Average Score:</strong> {averageScore.toFixed(2)}%</p>
          <p><strong>Tests Taken:</strong> {summaryData.length}</p>
          <button className="btn-start-test" onClick={handleStartMCQTest}>Start MCQ Test</button>
          <button className="btn-start-test" disabled>Start Coding Test (Coming Soon)</button>
        </div>
        {showSummary && (
          <div className="chart-container">
            <h3>Test Score Trend</h3>
            <Line data={scoreData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
