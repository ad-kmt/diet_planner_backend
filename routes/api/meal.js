const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { verifyToken, IsAdmin, IsUser } = require("../../middleware/auth");
const Meal = require("../../models/Meal");
const { LESS_VARIETY, MORE_VARIETY, DEFAULT } = require("../../services/constants/mealLimit");
const { shuffleMealPlan, shuffleBreakfast, shuffleSnacks, shuffleLunch, shuffleDinner, shuffleBreakfastSingle, shuffleLunchSingle, shuffleSnacksSingle, shuffleDinnerSingle } = require("../../services/core/meal/mealShuffler");
const ApiError = require("../../utils/ApiError");

/**
 * @swagger
 * /api/meal:
 *  get:
 *    summary: Get all meals.
 *    tags:
 *      - meal
 *    parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to get all meals
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *meal
 *      '404':
 *          description: Not found
 */
router.get("/", verifyToken,  async (req, res, next) => {
  try {
    const meals = await Meal.find().select('name mealType proteins fats carbs calories');
    res.json(meals);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal/?filter=xyz:
 *  get:
 *    summary: Get meals by filters. (Incomplete api)
 *    tags:
 *      - meal
 *    parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to get meals by filters
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *meal
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const filters = req.params;
    const { type, time, calories } = filters;

    const meals = await Meal.find({
      mealType: type,
      mealTime: time,
      calories: calories,
    });

    res.json(meals);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal:
 *   post:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     description: Only Admin
 *     summary: Create a meal.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *meal
 *     responses:
 *       '200':
 *          description: Successful
 */
router.post("/", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const newMeal = new Meal({
      name: req.body.name,
      recipe: req.body.recipe,
      calories: req.body.calories,
      nutriValues: req.body.nutriValues,
      mealTime: req.body.mealTime,
      mealType: req.body.mealType,
    });

    const meal = await newMeal.save();
    res.json(meal);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal/{id}:
 *   get:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: get a meal by id
 *     responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: *meal
 *      '404':
 *          description: Not found
 */
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    await meal.save();
    res.json(meal);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal/{id}:
 *   put:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     description: Only Admin
 *     summary: Update a meal.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *meal
 *     responses:
 *       '200':
 *          description: Successful
 */
router.put("/:id", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, {
      $set: req.body
    });
    res.json(meal);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal/{id}:
 *   delete:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Delete a meal.
 *     description: Only Admin
 *     responses:
 *       '204':
 *          description: Successful
 */
router.delete("/:id", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
    }

    await meal.remove();
    res.json({ msg: "Meal removed" });
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /api/meal/shuffle/meal:
 *   post:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              mealId:
 *                type: string
 *              mealCombo: *mealCombo
 *              mealType:
 *                type: string
 *                example: breakfast/lunch/snacks/dinner
 *              testFoodTag:
 *                type: string
 *              foodRestrictions:
 *                type: array
 *                items:
 *                  type: string
 *              gutHealing:
 *                type: boolean
 *     summary: Shuffle a single meal, inside a meal combo, inside a meal plan.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *              schema: 
 *                type: array
 *                items:
 *                  type: array
 *                  items:
 *                    type: string
 *       '404':
 *          description: Not found
*/
router.post('/shuffle/meal', verifyToken, IsUser, async (req, res, next) => {

  try {

    let {mealId, mealCombo, mealType, testFoodTag, foodRestrictions, gutHealing} = req.body

    var shuffleMealList;
    if(mealType == "breakfast") shuffleMealList= await shuffleBreakfastSingle({userId: req.user.id, mealCombo, shuffleMealId: mealId, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "lunch") shuffleMealList= await shuffleLunchSingle({userId: req.user.id, mealCombo, shuffleMealId: mealId, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "snacks") shuffleMealList= await shuffleSnacksSingle({userId: req.user.id, mealCombo, shuffleMealId: mealId, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "dinner") shuffleMealList= await shuffleDinnerSingle({userId: req.user.id, mealCombo, shuffleMealId: mealId, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    res.json(shuffleMealList);
  } catch (err) {
    next(err);
  }
});



/**
 * @swagger
 * /api/meal/shuffle/mealCombo:
 *   post:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              mealCombo: *mealCombo
 *              mealType:
 *                type: string
 *                example: breakfast/lunch/snacks/dinner
 *              testFoodTag:
 *                type: string
 *              foodRestrictions:
 *                type: array
 *                items:
 *                  type: string
 *              gutHealing:
 *                type: boolean
 *     summary: Shuffle a meal combo inside a meal plan.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *              schema: 
 *                type: array
 *                items:
 *                  type: array
 *                  items:
 *                    type: string
 *       '404':
 *          description: Not found
*/
router.post('/shuffle/mealCombo', verifyToken, IsUser, async (req, res, next) => {

  try {

    let {mealCombo, mealType, testFoodTag, foodRestrictions, gutHealing} = req.body

    var shuffleMealList;
    if(mealType == "breakfast") shuffleMealList= await shuffleBreakfast({userId: req.user.id, mealCombo, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "lunch") shuffleMealList= await shuffleLunch({userId: req.user.id, mealCombo, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "snacks") shuffleMealList= await shuffleSnacks({userId: req.user.id, mealCombo, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    if(mealType == "dinner") shuffleMealList= await shuffleDinner({userId: req.user.id, mealCombo, testFoodTag, extraFoodRestrictions: foodRestrictions, gutHealing});

    res.json(shuffleMealList);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/meal/shuffle/mealplan:
 *   post:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              variety:
 *                type: string
 *                example: "less/more" 
 *              foodRestrictions:
 *                type: array
 *                items: 
 *                  type: string
 *     summary: Shuffle complete meal plan.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items: *mealCombo
 *       '404':
 *          description: Not found
*/
router.post('/shuffle/mealplan', verifyToken, IsUser, async (req, res, next) => {

  try {
    let {variety, foodRestrictions} = req.body;
    let mealMaxLimit;
    if(variety == "less"){
      mealMaxLimit = LESS_VARIETY;
    } else if(variety == "more"){
      mealMaxLimit = MORE_VARIETY;
    } else {
      mealMaxLimit = DEFAULT;
    }
    let meals = await shuffleMealPlan(req.user.id, mealMaxLimit, foodRestrictions);
    res.json(meals);
  } catch (err) {
    next(err);
  }
});





module.exports = router;
