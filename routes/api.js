const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Correct answers for each level
const correctAnswers = {
    level1: ['4', '4'], // Update with correct answers for level 1
    level2: ['4', '4'], // Update with correct answers for level 2
    level3: ['4', '4', '4', '4'] // Update with correct answers for level 3
};

// Function to handle reading questions from file
const readQuestionsFromFile = (filePath, res) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);  
            return res.status(404).json({ error: 'Questions file not found' });
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Error reading questions file' });
            }
            try {
                const questions = JSON.parse(data);
                res.json(questions);
            } catch (parseError) {
                res.status(500).json({ error: 'Error parsing questions file' });
            }
        });
    });
};

// Routes for questions of Level 1
router.get('/questions/level1', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level1.json');
    readQuestionsFromFile(filePath, res);
});

// Routes for questions of Level 2
router.get('/questions/level2', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level2.json');
    readQuestionsFromFile(filePath, res);
});

// Routes for questions of Level 3
router.get('/questions/level3', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level3.json');
    readQuestionsFromFile(filePath, res);
});

// Submit answers
router.post('/submit-answers', (req, res) => {
    const { answers, level } = req.body; // รับระดับและคำตอบจากคำขอ
    let score = 0;

    // ตรวจสอบคำตอบตามระดับที่ถูกต้อง
    const correctAnswerSet = correctAnswers[`level${level}`];

    if (!correctAnswerSet) {
        return res.status(400).json({ error: 'Invalid level specified' });
    }

    // ตรวจสอบคำตอบ
    answers.forEach((answer, index) => {
        // ตรวจสอบว่าคำตอบตรงกับคำตอบที่ถูกต้องหรือไม่
        if (correctAnswerSet[index] === answer.a || correctAnswerSet[index] === answer.b || correctAnswerSet[index] === answer.c) {
            score += 10; // เพิ่มคะแนน
        }
    });

    res.json({ score });
});

module.exports = router;
