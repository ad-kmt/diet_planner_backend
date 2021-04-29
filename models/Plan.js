const mongoose = require('mongoose');

const Plan = new mongoose.Schema({
    name: { type: String },
    displayPrice: {type: Number},
    sellingPrice: {type: Number},
    discount: {type: Number},
    duration: {type: Number}
});

module.exports = mongoose.model('plan', Plan);