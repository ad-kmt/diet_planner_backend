const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    questions: [
        {
            question: {
                type: String
            },
            options: {
                type: [String]
            }
        }
    ]
});

module.exports = mongoose.model('quiz', QuizSchema, 'quizes');