const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');

const config = require('config');
const conclusion = config.get('Customer.conclusion');

const Quiz = require('../../models/Meal');
const Meal = require('../../models/Meal');



/**
 * @swagger
 * /api/meal:
 *  get:
 *    summary: Get all meals. (Incomplete api)
 *    tags:
 *      - meal
 *    description: Use to get all meals
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *meal
 */
router.get('/', async (req, res) => {
    try {
      const meals = await Meal.find();
      res.json(meals);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
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
 *      - in: query
 *        name: filter
 *        schema:
 *          type: string
 *    description: Use to get all meals
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *meal
 */
router.get('/', async (req, res) => {
  try {
    const filters = req.params;
    const {type, time, calories} = filters;

    const meals = await Meal.find({mealType: type, mealTime: time, calories: calories});
    
    res.json(meals);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/meal:
 *   post:
 *     tags:
 *       - meal
 *     summary: Create a meal. (Incomplete api)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *meal
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', auth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newMeal = new Meal({
        name: req.body.name,
        recipe: req.body.recipe,
        calories: req.body.calories,
        nutritionalValues: req.body.nutritionalValues,
        mealTime: req.body.mealTime,
        mealType: req.body.mealType
      });

      const meal = await newMeal.save();

      res.json(meal);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

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
 *     summary: Update a meal. (Incomplete api)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *meal
 *     responses:
 *       '200':
 *          description: Successful
*/
router.put('/:id', auth, async (req, res) => {

    try {
      const meal = await Meal.findOneAndUpdate(req.meal.id, req.body, { new: true, upsert: true, setDefaultsOnInsert: true });

      await meal.save();

      res.json(meal);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


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
 *     summary: Delete a meal.
 *     responses:
 *       '204':
 *          description: Successful
*/
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ msg: 'Meal not found' });
    }

    await meal.remove();
    res.json({ msg: 'Meal removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;