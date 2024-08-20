import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !question) {
            alert('Please upload a file and type a question.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            const uploadResponse = await axios.post('http://localhost:5000/upload', formData);
            const fileId = uploadResponse.data.file._id;

            const answerResponse = await axios.post('http://localhost:5000/get-answer', {
                question,
                fileId
            });

            setAnswer(answerResponse.data.answer);
        } catch (error) {
            console.error('Error uploading file:', error);
            setAnswer('An error occurred while fetching the answer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                <div className="chat-header">Upload File and Ask a Question</div>
                <div className="chat-body">
                    <div className="file-upload">
                        <input type="file" onChange={handleFileChange} className="file-input" />
                    </div>
                    <div className="question-box">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your question here..."
                            className="question-input"
                        />
                    </div>
                    <div className="send-button">
                        <button onClick={handleUpload} disabled={loading}>
                            {loading ? 'Loading...' : 'Send'}
                        </button>
                    </div>
                </div>
                {answer && (
                    <div className="chat-answer">
                        <strong>Answer:</strong> {answer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
