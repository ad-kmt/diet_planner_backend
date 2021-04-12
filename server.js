const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
var cors = require('cors');
const test = require('./services/test');
const generateSwaggerDocs = require('./config/swagger');
require("dotenv").config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({extended: false}));

//swagger options, swagger: automatic api documentation tool
// const swaggerOptions = {
//     swaggerDefinition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'FG4L API',
//             version: "1.0.0",
//             description: 'Fit Gut For Life API Information',
//             contact: {
//                 name: "Hitesh Kumawat"
//             },
//             servers: ["http://localhost:8000"],
//         },
//     },
//     apis: [`server.js`, `routes/api/*.js`, `swagger/*.yaml`]
// };

// const swaggerDocs = swaggerJsDocs(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateSwaggerDocs()));


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
app.use('/api/admin', require('./routes/api/admin'));
app.use('/api/payment', require('./routes/api/payment/payment'));
app.use('/api/meal', require('./routes/api/meal'));
app.use('/api/progress', require('./routes/api/progress'));


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

test();