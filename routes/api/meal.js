const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const { verifyToken, IsAdmin } = require("../../middleware/auth");
const Meal = require("../../models/Meal");

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
router.get("/", verifyToken,  async (req, res) => {
  try {
    const meals = await Meal.find().select('name mealType proteins fats carbs calories');
    res.json(meals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
router.get("/", verifyToken, async (req, res) => {
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
    console.error(err.message);
    res.status(500).send("Server Error");
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
router.post("/", verifyToken, IsAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
    console.error(err.message);
    res.status(500).send("Server Error");
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
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    await meal.save();

    res.json(meal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
router.put("/:id", verifyToken, IsAdmin, async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, (error, data) => {
      if (error) {
        console.log(error)
        return next(error);
      } else {
        // res.json(data)
        console.log('Meal updated successfully!')
      }
    });
    await meal.save();
    res.json(meal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
router.delete("/:id", verifyToken, IsAdmin, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ msg: "Meal not found" });
    }

    await meal.remove();
    res.json({ msg: "Meal removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/meal/shuffle?type=xyz:
 *   get:
 *     tags:
 *       - meal
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
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
 *              breakfast:
 *                type: string
 *              lunch:
 *                type: string
 *              dinner:
 *                type: string
 *     summary: switch the current meal.
 *     responses:
 *       '200':
 *          description: Successful
 *          content:
 *            application/json:
 *              schema: *meal
 *       '404':
 *          description: Not found
*/
router.get('/shuffle', verifyToken, async (req, res) => {

  try {
    var shuffledMeal
    if(req.query == "breakfast") shuffledMeal=shuffleBreakfast(req.body.id, req.body.mealCombo);

    if(req.query == "lunch") shuffledMeal=shuffleLunch(req.body.userId, req.body.mealCombo);

    if(req.query == "dinner") shuffledMeal=shuffleDinner(req.body.userId, req.body.mealCombo);

    res.json(shuffledMeal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
