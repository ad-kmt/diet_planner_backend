const mongoose = require('mongoose');

const Payment = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    amount: {type: Number},
    currency: {type: String},
    date: {type: Date},
    planId: {type: mongoose.Schema.Types.ObjectId},
    description: {type: String}
});

module.exports = mongoose.model('payment', Payment);