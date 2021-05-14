const express = require('express');
const morgan = require('./config/morgan');
const swaggerUi = require('swagger-ui-express');
var cors = require('cors');
const generateSwaggerDocs = require('./config/swagger');
const fileUpload = require('express-fileupload');
require("dotenv").config();
const ApiError = require('./utils/ApiError');
const { errorConverter, errorHandler } = require('./middleware/error');


const app = express();

// Init Middleware
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(cors());                                // enable cors
app.use(express.json({extended: false}));       // parse json request body
app.use(fileUpload({                            // enable files upload
    createParentPath: true
}));


//Swagger Docs API endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(generateSwaggerDocs()));


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

// Api Routes
app.use('/api/quiz', require('./routes/api/quiz'));
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/authentication/auth'));
app.use('/api/payment/stripe', require('./routes/api/payment/stripe'));
app.use('/api/plan', require('./routes/api/plan'));
app.use('/api/admin', require('./routes/api/admin'));
app.use('/api/payment', require('./routes/api/payment/payment'));
app.use('/api/meal', require('./routes/api/meal'));
app.use('/api/progress', require('./routes/api/progress'));
app.use('/api/service', require('./routes/api/service'));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
  });

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;







