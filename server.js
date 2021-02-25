const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
var cors = require('cors');

require("dotenv").config();

const app = express();
app.use(cors());

// Connect Database
connectDB();


// Init Middleware
app.use(express.json({extended: false}));

// // PASSPORT SETUP
// app.use(passport.initialize());
// app.use(passport.session());

// app.get('/success', (req, res) => res.send(userProfile));
// app.get('/error', (req, res) => res.send("error logging in"));

// passport.serializeUser(function(user, cb) {
//     cb(null, user);
// });
  
// passport.deserializeUser(function(obj, cb) {
//     cb(null, obj);
// });

// app.use(session({
//     resave: false,
//     saveUninitialized: true,
//     secret: 'SECRET' 
// }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/quiz', require('./routes/api/quiz'));
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));