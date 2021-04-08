const mongoose = require('mongoose');

const Progress = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    date: {type: Date},
    height: { type: Number }, 
    weight: { type: Number},
    mealsConsumed: {
        breakfastId: {type: mongoose.Schema.Types.ObjectId},
        lunchId: {type: mongoose.Schema.Types.ObjectId},
        dinnerId: {type: mongoose.Schema.Types.ObjectId}
    },
    waterIntake: {type: Number},
    activity: {type: Number},
    mood: {type: String},
    bloating: {type: Boolean},
    poop: {type: String}
});

module.exports = mongoose.model('progress', Progress);