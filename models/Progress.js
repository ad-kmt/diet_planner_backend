const mongoose = require('mongoose');

const Progress = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    date: {type: Date},
    height: { type: Number }, 
    weight: { type: Number},
    mealsConsumed: {
        breakfast: {type: mongoose.Schema.Types.ObjectId},
        lunch: {type: mongoose.Schema.Types.ObjectId},
        snacks: {type: mongoose.Schema.Types.ObjectId},
        dinner: {type: mongoose.Schema.Types.ObjectId}
    },
    waterIntake: {type: Number},
    activity: {type: Number},
    mood: {type: String},
    bloating: {type: Boolean},
    poop: {type: String}
});

module.exports = mongoose.model('progress', Progress);