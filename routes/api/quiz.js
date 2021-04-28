const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Quiz = require("../../models/Quiz");
const {verifyToken, IsAdmin, IsUser}= require("../../middleware/auth");
const {quizEvaluator} = require("../../services/core/quizEvaluator");
const User = require("../../models/User");
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
router.post("/answers", verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // const user = await User.findById(req.user.id);
    let gender,age,quizResponse,healthRecords;
    const input = req.body;
    const result = quizEvaluator(input);
    
    input[0].questions[0].options.map(option => {
      if(option.selected) gender = option.option;
    });
    quizResponse = input;
    age = input[0].questions[2].options[0];
    
    healthRecords=result.healthRecords;
    const user = {gender,age,quizResponse,healthRecords}
    await User.findByIdAndUpdate(req.user.id, user);
    // console.log(result);
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
router.post("/", verifyToken, IsAdmin, async (req, res) => {
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
  router.put("/:id", verifyToken, IsAdmin, async (req, res) => {
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
router.delete("/:id", verifyToken, IsAdmin, async (req, res) => {
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
