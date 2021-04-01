const mongoose = require('mongoose');

const Plan = new mongoose.Schema({
    name: { type: String },
    displayPrice: {type: Number},
    onsalePrice: {type: Number},
    discount: {type: Number},
    duration: {type: Date}
});

module.exports = mongoose.model('plan', Plan);