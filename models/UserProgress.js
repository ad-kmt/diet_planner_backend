const mongoose = require('mongoose');

const UserProgress = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId },
    date: {type: Date},
    height: { type: Number }, 
    weight: { type: Number},
    mealsConsumed: [{
        mealID: {type: String},
        mealType: {type: String}
    }],
    waterIntake: {type: Number},
    activity: {type: Number},
    mood: {type: String},
    bloating: {type: Boolean},
    poop: {type: String}
});

module.exports = mongoose.model('userProgress', UserProgress);