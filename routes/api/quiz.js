const express = require('express');
const router = express.Router();
const Quiz = require('../../models/Quiz');

// @route    GET /api/quiz
// @desc     Get all questions
// @access   Public
router.get('/', async (req, res) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;