const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Fname: {
        type: String,
        required: true
    },
    Lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        area: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        }
    },
    quizResponse: {
        questions: [{
            question: {
                type: String
            },
            options: {
                type: [{
                    symptom:{
                        type: String
                    },
                    selected: {
                        type: Boolean
                    }
                }]
            }
        }]
    }
});

module.exports = mongoose.model('user', UserSchema);