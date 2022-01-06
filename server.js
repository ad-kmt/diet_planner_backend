const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./config/logger');
require("dotenv").config();

let server;
const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
  logger.info('Connected to MongoDB');
    server = app.listen(PORT, () => {
    logger.info(`Listening to port ${PORT}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

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