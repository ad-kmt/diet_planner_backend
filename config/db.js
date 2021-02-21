const mongoose = require('mongoose');
const config = require('config');
const db = config.get('Customer.mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
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
// mongodb+srv://hitesh123:hitesh123@devconnector.usefm.mongodb.net/test?retryWrites=true&w=majority

module.exports = connectDB;