const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    local:{
        firstName: {
            type: String,
        },
        lastName: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String,
        }
    },
    google:{
        id: {
            type: String,
        },
        token: {
            type: String
        },
        name: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
        }
    },
    facebook:{
        id: String,
        token: String,
        firstName: String,
        lastName: String,
        email: String
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
    quizResponse: {
        section: {type: String},
        questions: [{
            question: {
                qname: {type: String},
                qtype: {type: String}
            },
            options: [
                {
                    option:{type: String},
                    selected: {type: Boolean}
                }
            ]
        }]
    },
    currentPlan: {
        name: {type: String},
        price: {type: String},
        paymentId: {type: mongoose.Schema.Types.ObjectId},
        expiry: {type: Date}
    },
    healthrecords: {
        height: {type: Number},
        weight: {type: Number},
        desiredWeight: {type: Number},
        desiredCalories: {type: Number},
        desiredNutrients: {
            proteins: {type: Number},
            fats: {type: Number},
            carbs: {type: Number}
        },
        ailments: [
            {
                ailment: {type: String},
            }
        ],
        foodType: {type: String},
        foodRestrictions: [
            {
                restriction: {type: String}
            }
        ],
        activityLevel: {type: String}
    }
});

module.exports = mongoose.model('user', UserSchema);