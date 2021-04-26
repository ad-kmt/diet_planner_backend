const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const { evaluateQuizResult } = require("../../services/ml/brain");
const config = require("config");
const conclusion = config.get("Customer.conclusion");

const Quiz = require("../../models/Quiz");
const adminAuth = require("../../middleware/adminAuth");
// const conclusion=require('../../data/conclusion.json');

// @route    GET /api/quiz
// @desc     Get all questions
// @access   Public
/**
 * @swagger
 * /api/quiz/:
 *  get:
 *    tags:
 *      - quiz
 *    description: Use to get all quiz questions.
 *    summary: Get quiz questions
 *    responses:
 *      '200':
 *        description: A successful response.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items: *quizSection
 */
router.get("/", async (req, res) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/quiz/answers:
 *   post:
 *     tags:
 *       - quiz
 *     summary: post quiz answers.
 *     description: Use to post answers to quiz question to get result as a response. \'answer\' field inside request body can be a number/string/array{jsonObject} depending on question type.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSectionAnswer
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.post("/answers", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const input = req.body;
    let symptoms=[];
    input[1].questions.map(question => question.options.map(option=> {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    }));
    input[2].questions.map(question => question.options.map(option=> {
      option.selected ? symptoms.push(1) : symptoms.push(0);
    }));
    // const symptoms = [1,1,1,1,1,1,1,1,1,1,1,1,01,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    const conclusions = evaluateQuizResult(symptoms);

    // const { gender, activity, age, height, weight, desiredWeight } = input[0];
    
    let bmr = 10 * input[0].questions[4] + 6.25 * input[0].questions[3] - 5 * input[0].questions[2];
    if (input[0].questions[0] === "Male") bmr += 5;
    else bmr -= 161;

    let tdee;

    if (input[0].questions[1] === 1) tdee = 1.2 * bmr;
    // Sedentary/Couch Potato
    else if (input[0].questions[1] === 2) tdee = 1.375 * bmr;
    // Light Exercise/Somewhat Active
    else if (input[0].questions[1] === 3) tdee = 1.55 * bmr;
    // Moderate Exercise/Average Activity
    else if (input[0].questions[1] === 4) tdee = 1.725 * bmr;
    // Active Individuals/Very Active
    else if (input[0].questions[1] === 5) tdee = 1.9 * bmr; // Extremely Active Individuals/Extremely Active

    let calorie;

    if (input[0].questions[5] === 1) calorie = tdee + 250;
    else if (input[0].questions[5] === -1) calorie = tdee - 500;
    else if (input[0].questions[5] === 0) calorie = tdee;

    const result = [conclusions, calorie];

    console.log(conclusions);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/quiz:
 *   post:
 *     tags:
 *       - quiz
 *     summary: Creates a quiz section.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
router.post("/", adminAuth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newQuiz = new Quiz({
      section: req.body.section,
      questions: req.body.questions,
    });

    const quiz = await newQuiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/quiz/{id}:
 *   put:
 *     tags:
 *       - quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Update a quiz section.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
// router.put("/:id", auth, async (req, res) => {
  router.put("/:id", adminAuth, async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, (error, data) => {
        if (error) {
          console.log(error)
          return next(error);
        } else {
          // res.json(data)
          console.log('Quiz section updated successfully!')
        }
      });
      await quiz.save();
      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  /**
 * @swagger
 * /api/quiz/{id}:
 *   delete:
 *     tags:
 *       - quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Delete a quiz section.
 *     responses:
 *       '204':
 *          description: Successful
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz section not found" });
    }

    await quiz.remove();
    res.json({ msg: "Quiz section removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
