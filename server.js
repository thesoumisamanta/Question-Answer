const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with specific origin
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL if different
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer to handle file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.pdf' || ext === '.docx') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'), false);
        }
    }
}).single('file');

// Function to extract text from PDF
async function extractTextFromPDF(fileBuffer) {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw error;
    }
}

// Function to extract text from DOCX
async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw error;
    }
}

// Endpoint for handling file upload and question
app.post('/upload', (req, res) => {
    upload(req, res, async function (err) {
        console.log('Received request');
        console.log('File:', req.file);
        console.log('Question:', req.body.question);

        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `File upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ error: `Unknown error: ${err.message}` });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        if (!req.body.question) {
            return res.status(400).json({ error: 'No question provided.' });
        }

        const filePath = req.file.path;
        const question = req.body.question.toLowerCase();

        console.log(`Uploaded file path: ${filePath}`);
        console.log(`Question: ${question}`);

        try {
            const extname = path.extname(req.file.originalname).toLowerCase();
            let text = '';

            if (extname === '.pdf') {
                const fileBuffer = fs.readFileSync(filePath);
                text = await extractTextFromPDF(fileBuffer);
            } else if (extname === '.docx') {
                text = await extractTextFromDOCX(filePath);
            } else {
                return res.status(400).json({ error: 'Unsupported file type. Only PDF and DOCX files are supported.' });
            }

            text = text.toLowerCase();

            if (text.includes(question)) {
                const answerStart = text.indexOf(question);
                const answerEnd = Math.min(answerStart + 1000, text.length);
                const answer = text.substring(answerStart, answerEnd);

                res.json({ answer: `Answer: ${answer}` });
            } else {
                res.json({ answer: "Sorry, this topic is not available in the file." });
            }

            // Clean up: delete the uploaded file
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error('Error processing the file:', error);
            res.status(500).json({ error: `Failed to analyze the file: ${error.message}` });
        }
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});