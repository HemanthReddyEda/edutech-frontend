import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
// import './CodingExam.css';

const CodingExam = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(900); // 15 mins
  const [results, setResults] = useState(null);
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await axios.get('http://localhost:5000/api/code/questions/today');
      setQuestions(res.data);
      if (res.data.length > 0) {
        const first = res.data[0];
        setSelectedQuestion(first);
        setCode(first.starterCode[language] || '');
      }
    };
    fetchQuestions();
  }, [language]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRun = async () => {
    if (!selectedQuestion) return;
    try {
      const res = await axios.post('http://localhost:5000/api/code/compile', {
        code,
        language,
        questionId: selectedQuestion._id,
        studentId // used only for final submission control
      });
      setResults(res.data);
    } catch (err) {
      alert("Error: " + err?.response?.data?.error || "Run failed");
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion) return;
    try {
      const res = await axios.post('http://localhost:5000/api/code/compile', {
        code,
        language,
        questionId: selectedQuestion._id,
        studentId
      });
      setResults(res.data);
      setFinalSubmitted(true);
      alert("✅ Final submission saved.");
    } catch (err) {
      alert("❌ Submission failed: " + err?.response?.data?.error);
    }
  };

  return (
    <div className="coding-exam-container">
      <h1>👨‍💻 Coding Exam</h1>
      <div className="top-bar">
        <label>Select Language: </label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>
        <span className="timer">⏰ Time Left: {timer}s</span>
      </div>

      {selectedQuestion && (
        <div className="question-box">
          <h3>{selectedQuestion.title}</h3>
          <p>{selectedQuestion.description}</p>
        </div>
      )}

      <Editor
        height="400px"
        defaultLanguage={language}
        value={code}
        onChange={val => setCode(val)}
        options={{ readOnly: finalSubmitted || timer === 0 }}
      />

      <div className="actions">
        <button onClick={handleRun} disabled={finalSubmitted || timer === 0}>▶️ Run</button>
        <button onClick={handleSubmit} disabled={finalSubmitted || timer === 0}>✅ Submit</button>
      </div>

      {results && (
        <div className="results-panel">
          <h4>Results:</h4>
          {results.results.map((r, idx) => (
            <div key={idx} className={`result-item ${r.pass ? 'pass' : 'fail'}`}>
              <p>Test {idx + 1}: {r.pass ? "✅ Pass" : "❌ Fail"}</p>
              <p><strong>Input:</strong> {r.input}</p>
              <p><strong>Expected:</strong> {r.expected}</p>
              <p><strong>Actual:</strong> {r.actual}</p>
            </div>
          ))}
          <p><strong>Total Passed:</strong> {results.passedCount} / {results.total}</p>
        </div>
      )}
    </div>
  );
};

export default CodingExam;