const { evaluateQuizResult } = require("./ml/brain");
const config = require("config");
const { getMealPlan } = require("./core/meal/mealPlanner");
const { GRAIN, DAIRY_LACTOSE, EGG } = require("./constants/gutTags");
const Meal = require("../models/Meal");
const { DEFAULT } = require("./constants/mealLimit");
const { shuffleMealPlan, shuffleBreakfast, shuffleBreakfastSingle, shuffleLunch, shuffleSnacks, shuffleDinner, shuffleLunchSingle, shuffleSnacksSingle, shuffleDinnerSingle } = require("./core/meal/mealShuffler");
const conclusionMap = config.get("Customer.conclusion");

exports.testMultipleMealPlan = async () => {
  let testMeals = {
    breakfast: true,
    lunch: true,
    snacks: false,
    dinner: false,
  };

  let m = await getMealPlan({
    userId: "6097e6ce2326a9115415b1d7",
    mealMaxLimit: DEFAULT,
    days: 2,
  });

  m = await getMealPlan({
    userId: "6097e6ce2326a9115415b1d7",
    mealMaxLimit: DEFAULT,
    days: 2,
    mealMap: m.mealMap
  });

  m = await getMealPlan({
    userId: "6097e6ce2326a9115415b1d7",
    mealMaxLimit: DEFAULT,
    days: 2,
    mealMap: m.mealMap
  });
};

exports.testFoodRestriction = async () => {
  let testMeals = {
    breakfast: true,
    lunch: true,
    snacks: false,
    dinner: false,
  };

  let m = await getMealPlan({
    userId: "6097e6ce2326a9115415b1d7",
    mealMaxLimit: 2,
    days: 2,
    foodTag: EGG,
    testMeals: testMeals,
  });
}

exports.testShuffleMealPlan = async () => {
  let meals = await shuffleMealPlan("6097e6ce2326a9115415b1d7", DEFAULT);
  console.log(meals);
}

exports.testShuffleMeal = async () => {

  let mealCombo = {
    "breakfast": [
        "6096f2861d9bb945b0ff693a",
        "6096f28b1d9bb945b0ff6c8c"
    ],
    "lunch": [
        "6096f2911d9bb945b0ff70d6",
        "6096f2911d9bb945b0ff7075"
    ],
    "snacks": [
        "6096f2921d9bb945b0ff710a",
        "6096f2901d9bb945b0ff6ffd"
    ],
    "dinner": [
        "6096f28f1d9bb945b0ff6f5c",
        "6096f2901d9bb945b0ff6fbf"
    ],
}

  let mealShuffleList = await shuffleDinner({userId: "6097e6ce2326a9115415b1d7", mealCombo});
  console.log(mealShuffleList);
}

exports.testShuffleMealSingle = async () => {

  let mealCombo = {
    "breakfast": [
        "6096f2861d9bb945b0ff693a",
        "6096f28e1d9bb945b0ff6e3f"
    ],
    "lunch": [
        "6096f2911d9bb945b0ff70d6",
        "6096f2911d9bb945b0ff7075"
    ],
    "snacks": [
        "6096f2921d9bb945b0ff710a",
        "6096f2901d9bb945b0ff6ffd"
    ],
    "dinner": [
        "6096f28f1d9bb945b0ff6f5c",
        "6096f2901d9bb945b0ff6fbf"
    ],
}

  let mealShuffleList = await shuffleDinnerSingle({userId: "6097e6ce2326a9115415b1d7",shuffleMealId: "6096f28f1d9bb945b0ff6f5c", mealCombo});
  console.log(mealShuffleList);
}

