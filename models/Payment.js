const mongoose = require('mongoose');

const Payment = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId},
    amount: {type: Number},
    currency: {type: String},
    date: {type: Date},
    plan: {type: String},
    description: {type: String}
});

module.exports = mongoose.model('payment', Payment);