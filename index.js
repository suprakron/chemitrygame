const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', require('./routes/api')); // Use api.js

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/levelnum', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'level_number.html'));
});


// Game Pages
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'game.html'));
});

app.get('/game_level2', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'game_level2.html'));
});

app.get('/game_level3', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'game_level3.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
