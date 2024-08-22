const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

 
router.get('/questions/level1', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level1.json');

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
});

// เส้นทางสำหรับคำถามของ Level 2
router.get('/questions/level2', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level2.json');

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
});

// เส้นทางสำหรับคำถามของ Level 3
router.get('/questions/level3', (req, res) => {
    const filePath = path.join(__dirname, '../data/question_level3.json');

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
});
router.post('/submit-answers', (req, res) => {
    const answers = req.body.answers;
    let score = 0;

  
    answers.forEach((answer, index) => {
        
        if (answer === correctAnswers[index]) {
            score += 10;
        }
    });

   
    res.json({ score });
});

module.exports = router;
