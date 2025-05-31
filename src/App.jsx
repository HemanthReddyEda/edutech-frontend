import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import ExamInterface from './ExamInterface';
import AdminDashboard from './AdminDashboard';
import ManageQuestions from './ManageQuestions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam" element={<ExamInterface />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-questions" element={<ManageQuestions />}/>
      </Routes>
    </Router>
  );
}

export default App;
