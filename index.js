const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
var cors = require('cors');
const test = require('./services/test');
const generateSwaggerDocs = require('./config/swagger');
const {  trainModelFromExcel } = require('./services/ml/brain');
const { populateMealDb } = require('./services/core/meal/mealExcelToDb');
const { populateQuizDb } = require('./services/core/quiz/quizExcelToDb');
const fileUpload = require('express-fileupload');
const { getMealPlan } = require('./services/core/meal/mealPlanner');
require("dotenv").config();
const {DateTime} = require('luxon');
const { postPaymentUpdate } = require('./services/core/user/paymentService');
const { GLUTEN, EGG, DAIRY_LACTOSE, DAIRY, GRAIN } = require('./services/constants/gutTags');
const Meal = require('./models/Meal');


const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({extended: false}));
app.use(fileUpload({           // enable files upload
    createParentPath: true
}));


//Swagger Docs API endpoint
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
app.use('/api/service', require('./routes/api/service'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// test();
// populateMealDb();
// trainModelFromExcel();
// populateQuizDb();
// let plan = {
//     name: "FG4L",
//     productBy: "Sebastian Fitness Solutions",
//     displayPrice: 100,
//     sellingPrice: 50,
//     discount: 50,
//     duration: 30,
// }
// postPaymentUpdate("609965a8125f2d4984d22b38", plan);
// test.testMultipleMealPlan();
// test.testFoodRestriction();
// test.testShuffleMealPlan();
// test.testShuffleMeal()




