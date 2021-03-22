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
    const filters = req.body;
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