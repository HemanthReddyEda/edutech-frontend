import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExamInterface.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExamInterface = ({ examId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-production-6281.up.railway.app/api/student/test', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const examQuestions = response.data;

        setQuestions(examQuestions);
        const initialAnswers = {};
        examQuestions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setSelectedAnswers(initialAnswers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load exam questions. Please try again.');
        setLoading(false);
      }
    };

    fetchQuestions();

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    const preventContextMenu = (e) => e.preventDefault();
    const preventCopyPaste = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const blockDevTools = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventCopyPaste);
    document.addEventListener('keydown', blockDevTools);

    return () => {
      clearInterval(timer);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventCopyPaste);
      document.removeEventListener('keydown', blockDevTools);
    };
  }, [examId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: optionIndex });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    const now = new Date();
    const istHour = now.getHours();
    if (istHour < 10 || istHour >= 18) {
      alert("❌ Test submissions are only allowed between 10 AM and 6 PM IST.");
      return;
    }

    let correctAnswers = 0;
    const detailedResults = questions.map((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correctAnswerIndex;
      if (isCorrect) correctAnswers++;
      return {
        question: question.question,
        userAnswer: selectedAnswers[index] !== null ? question.options[selectedAnswers[index]] : 'Not answered',
        correctAnswer: question.options[question.correctAnswerIndex],
        isCorrect
      };
    });

    const score = (correctAnswers / questions.length) * 100;
    const attempted = questions.length - Object.values(selectedAnswers).filter(v => v === null).length;
    const unanswered = questions.length - attempted;
    const wrongAnswers = attempted - correctAnswers;

    const resultsData = {
      totalQuestions: questions.length,
      attempted,
      unanswered,
      correctAnswers,
      wrongAnswers,
      score: score.toFixed(2),
      detailedResults
    };

    setResults(resultsData);
    setExamSubmitted(true);

    const token = localStorage.getItem('token');
    const answers = questions.map((q, index) => selectedAnswers[index]);
    const questionIds = questions.map(q => q._id);
    const payload = { answers, questionIds };

    try {
      await axios.post('https://backend-production-6281.up.railway.app/api/student/submit-test', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("❌ Test already submitted for today.");
      } else {
        alert("Submission failed. Please try again.");
      }
      return;
    }

    if (onComplete) onComplete(resultsData);
  };

  const confirmSubmit = () => {
    const unansweredCount = Object.values(selectedAnswers).filter(v => v === null).length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      if (confirm) handleSubmitExam();
    } else {
      handleSubmitExam();
    }
  };

  if (loading) return <div className="exam-loading">Loading exam questions...</div>;
  if (error) return <div className="exam-error">{error}</div>;
  if (questions.length === 0) return <div className="exam-error">No questions available for this exam.</div>;

  if (examSubmitted) {
    const data = {
      labels: ['Correct', 'Wrong', 'Unanswered'],
      datasets: [{
        data: [results.correctAnswers, results.wrongAnswers, results.unanswered],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        hoverOffset: 10
      }]
    };

    const feedback = results.score >= 80 ? 'Excellent performance! 🎓' :
                     results.score >= 50 ? 'Good job! Try again for perfection.' :
                     'Needs improvement. Keep practicing! 💪';

    return (
      <div className="results-container">
        <h2>🎉 Exam Summary</h2>
        <div className="results-summary">
          <p><strong>Total Questions:</strong> {results.totalQuestions}</p>
          <p><strong>Attempted:</strong> {results.attempted}</p>
          <p><strong>Correct Answers:</strong> {results.correctAnswers}</p>
          <p><strong>Wrong Answers:</strong> {results.wrongAnswers}</p>
          <p><strong>Score:</strong> {results.score}%</p>
          <p><strong>Feedback:</strong> {feedback}</p>
          <div style={{ maxWidth: '300px', margin: '20px auto' }}>
            <Doughnut data={data} />
          </div>
        </div>

        <h3 style={{ marginTop: '30px' }}>📋 Detailed Answers</h3>
        <div className="detailed-results">
          {results.detailedResults.map((result, index) => (
            <div key={index} className={`result-item ${result.isCorrect ? 'correct' : result.userAnswer === 'Not answered' ? 'unanswered' : 'incorrect'}`}>
              <p><strong>Q{index + 1}:</strong> {result.question}</p>
              <p><strong>Your Answer:</strong> {result.userAnswer}</p>
              <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-previous" onClick={() => window.location.href = '/student-dashboard'}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isSubmitDisabled = Object.values(selectedAnswers).every(a => a === null);

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>MCQ Exam</h2>
        <div className="timer">Time Remaining: {formatTime(timeLeft)}</div>
      </div>

      <div className="question-navigation">
        {questions.map((_, index) => (
          <button
            key={index}
            className={`question-number ${currentQuestionIndex === index ? 'active' : ''} ${
              selectedAnswers[index] !== null ? 'answered' : ''
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
        </div>

        <div className="question-content">
          <p>{currentQuestion.question}</p>

          <div className="options-list">
            {currentQuestion.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`option ${selectedAnswers[currentQuestionIndex] === optionIndex ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
              >
                <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="question-actions">
          <button
            className="btn-previous"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button className="btn-next" onClick={goToNextQuestion}>
              Next
            </button>
          ) : (
            <button className="btn-submit" onClick={confirmSubmit} disabled={isSubmitDisabled}>
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
