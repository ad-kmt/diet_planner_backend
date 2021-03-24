const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');

const config = require('config');
const conclusion = config.get('Customer.conclusion');

const Quiz = require('../../models/Meal');
const Meal = require('../../models/Meal');

// @route    GET /api/admin/meal
// @desc     Get all meals
// @access   Public

/**
 * @swagger
 * /api/meal/:
 *  get:
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
 *      '404':
 *          description: Not found
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

// @route    GET /api/admin/meal
// @desc     Get meals by filter
// @access   Public
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

// @route    DELETE /api/admin/meal
// @desc     Delete a meal
// @access   Public

/**
 * @swagger
 * /api/meal/{id}:
 *  delete:
 *    tags:
 *      - meal
 *    parameters:
 *      -   in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *          description: mealId
 *    description: Use to delete a meal with id in URI
 *    responses:
 *      '204':
 *        description: meal deleted successfully
 */
router.delete('/', async (req, res) => {
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