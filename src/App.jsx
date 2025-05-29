import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import ExamInterface from './ExamInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam" element={<ExamInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
