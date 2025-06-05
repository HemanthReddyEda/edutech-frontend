import React, { useState } from 'react';
import axios from 'axios';

const AdminCodingForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cpp: '',
    java: '',
    python: '',
    duration: 900,
    date: ''
  });

  const [testCases, setTestCases] = useState([{ input: '', expected: '' }]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expected: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const question = {
        title: formData.title,
        description: formData.description,
        starterCode: {
          cpp: formData.cpp,
          java: formData.java,
          python: formData.python
        },
        testCases,
        duration: Number(formData.duration),
        date: formData.date
      };

      await axios.post("http://localhost:5000/api/code/questions", question);
      alert("✅ Question added successfully!");

      // Reset form
      setFormData({
        title: '',
        description: '',
        cpp: '',
        java: '',
        python: '',
        duration: 900,
        date: ''
      });
      setTestCases([{ input: '', expected: '' }]);
    } catch (err) {
      console.error(err);
      alert("❌ Error adding question.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧠 Add Coding Question</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required /><br />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required /><br />
        <textarea name="cpp" placeholder="C++ Starter Code" value={formData.cpp} onChange={handleChange} /><br />
        <textarea name="java" placeholder="Java Starter Code" value={formData.java} onChange={handleChange} /><br />
        <textarea name="python" placeholder="Python Starter Code" value={formData.python} onChange={handleChange} /><br />
        <input name="duration" type="number" placeholder="Duration (seconds)" value={formData.duration} onChange={handleChange} /><br />
        <input name="date" type="date" value={formData.date} onChange={handleChange} required /><br />
        
        <h4>Test Cases</h4>
        {testCases.map((tc, idx) => (
          <div key={idx}>
            <input
              placeholder="Input"
              value={tc.input}
              onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
              required
            />
            <input
              placeholder="Expected"
              value={tc.expected}
              onChange={e => handleTestCaseChange(idx, 'expected', e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addTestCase}>+ Add Test Case</button><br /><br />
        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
};

export default AdminCodingForm;
