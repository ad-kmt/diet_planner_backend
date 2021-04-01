const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const swaggerJsDocs = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
var cors = require('cors');
const test = require('./services/test');
require("dotenv").config();


//middleware
const app = express();
app.use(cors());

//swagger options, swagger: automatic api documentation tool
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'FG4L API',
            version: "1.0.0",
            description: 'Fit Gut For Life API Information',
            contact: {
                name: "Hitesh Kumawat"
            },
            servers: ["http://localhost:8000"],
        },
    },
    apis: [`server.js`, `routes/api/*.js`, `swagger/*.yaml`]
};

const swaggerDocs = swaggerJsDocs(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

/**
 * @swagger
 * /:
 *  get:
 *    description: Use to check if server is running.
 *    responses:
 *      '200':
 *        description: A successful response.
 */
app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/quiz', require('./routes/api/quiz'));
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/authentication/auth'));
app.use('/api/payment/stripe', require('./routes/api/payment/stripe'));
app.use('/api/plan', require('./routes/api/plan'));


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

test();