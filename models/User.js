const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    account: {
        local:{
            password: {
                type: String,
            },
            resetPasswordLink: {
                data: String,
                default: ''
            }
        },
        google:{
            id: {
                type: String,
            },
            token: {
                type: String
            },
        },
        facebook:{
            id: String,
            token: String,
        },
    },
    contact: {type: Number},
    dateOfBirth: {type: Date},
    gender: {type: String},
    age: {type: Number},
    address: {
        street: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        pincode: {type: Number},
    },
    quizResponse: [{
        sectionNumber: {type: Number},
        sectionName: {type: String},
        questions: [{
            question: {type: String},
            type: {type: String},
            options: [
                {
                    option:{type: String},
                    selected: {type: Boolean}
                }
            ]
        }]
    }],
    currentPlan: {
        planId: {type: mongoose.Schema.Types.ObjectId},
        name: {type: String},
        price: {type: String},
        paymentId: {type: mongoose.Schema.Types.ObjectId},
        startDate: {type: Date},
        expiryDate: {type: Date}
    },
    healthRecords: {
        height: {type: Number},
        weight: {type: Number},
        desiredWeight: {type: Number},
        desiredCalories: {type: Number},
        desiredNutrients: {
            proteins: {type: Number},
            fats: {type: Number},
            carbs: {type: Number}
        },
        quizConclusion: [String],
        foodRestrictions: [String],
        activity: {type: String}
    }
});

module.exports = mongoose.model('user', UserSchema);