import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import ExamInterface from './ExamInterface';
import AdminDashboard from './AdminDashboard';
import ManageQuestions from './ManageQuestions';
import AdminCodingForm from './AdminCodingForm';
import CodingExam from './CodingExam';
import ViewReports from './ViewReports';
import ResetStudentsPage from './ResetStudentsPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam" element={<ExamInterface />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-questions" element={<ManageQuestions />}/>
        <Route path="/admin/add-coding-question" element={<AdminCodingForm />} />
        <Route path="/coding-exam" element={<CodingExam />} />
        <Route path="/admin/reports" element={<ViewReports />} />
        <Route path="/admin/reset-students" element={<ResetStudentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
