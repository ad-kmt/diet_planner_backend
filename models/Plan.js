const mongoose = require('mongoose');

const Plan = new mongoose.Schema({
    plan:[
        {
            name: { type: String },
            price: {type: Number},
            duration: { type: Date }
        }
    ]
});

module.exports = mongoose.model('plan', Plan);