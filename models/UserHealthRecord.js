const mongoose = require('mongoose');

const HealthRecord = new mongoose.Schema({
    userID: { type: String },
    height: { type: String },
    weight: {
        type: String
    },
    allergies: [                            // includes allergies from food materials and surrounding environment
        {
            Allergy: { type: String }
        } 
    ],
    ailments: [                             // Ailments and diseases that the user might have like Diabetes, defficiency diseases etc.
        {
            ailment: { type: String }
        } 
    ],
    foodPreferences: [
        {
            foodPreference: { type: String }
        } 
    ]
});

module.exports = mongoose.model('healthRecord', HealthRecord);