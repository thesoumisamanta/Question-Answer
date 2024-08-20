import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Function to upload file and ask question
const uploadFileAndAskQuestion = async (file, question) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('question', question);

  console.log('File:', file);
  console.log('Question:', question);

  try {
    const response = await axios.post('http://localhost:5000/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error submitting the form:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

const App = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file || !question) {
      setError('Please upload a file and enter a question.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await uploadFileAndAskQuestion(file, question);
      setAnswer(result.answer);
    } catch (error) {
      setAnswer('');
      setError('An error occurred while fetching the answer. Please try again.');
      console.error('Detailed error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Document Analyzer</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={question}
            onChange={handleQuestionChange}
            placeholder="Type your question here..."
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Get Description'}
        </button>
      </form>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}
      {answer && (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;