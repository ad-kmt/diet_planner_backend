//Connecting to MongoDB
const mongoose = require('mongoose');
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('MongoDB connected...')
    } catch(err) {
        console.group(err.message);
        //Exit process with failure
        process.exit(1);
    }
}
module.exports = connectDB;