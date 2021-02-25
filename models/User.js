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
        
});

module.exports = mongoose.model('user', UserSchema);