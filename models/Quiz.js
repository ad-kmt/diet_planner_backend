const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
            section: {type: String},
            questions: [
                {
                    question: {
                        type: String
                    },
                    options: [
                        {
                            option: {type: String}
                        }
                    ]
                }
            ]
});



module.exports = mongoose.model('quiz', QuizSchema, 'quizes');