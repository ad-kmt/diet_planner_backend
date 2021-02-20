const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const brain = require('../../ml/brain');

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

// @route    POST api/quiz
// @desc     post quiz data
// @access   Private
router.post('/', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const input=req.body.map(question => question.options.map(option=> option.selected));
      brain(input);
      return res.status(200).send("Success");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);