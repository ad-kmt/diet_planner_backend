const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/quiz', require('./routes/api/quiz'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));