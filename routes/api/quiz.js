const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Quiz = require("../../models/Quiz");
const {verifyToken, IsAdmin, IsUser}= require("../../middleware/auth");
const {quizEvaluator} = require("../../services/core/quiz/quizEvaluator");
const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
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
router.get("/", async (req, res, next) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/quiz/answers:
 *   post:
 *     tags:
 *       - quiz
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
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
router.post("/answers", verifyToken, IsUser, async (req, res, next) => {

  try {
    const input = req.body;
    const result = await quizEvaluator(input, req.user.id);
    // console.log(result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/quiz:
 *   post:
 *     tags:
 *       - quiz
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Creates a quiz section.
 *     description: Only Admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
router.post("/", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const newQuiz = new Quiz({
      section: req.body.section,
      questions: req.body.questions,
    });

    const quiz = await newQuiz.save();

    res.json(quiz);
  } catch (err) {
    next(err);
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Update a quiz section.
 *     description: Only Admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *quizSection
 *     responses:
 *       '200':
 *          description: Successful
 */
  router.put("/:id", verifyToken, IsAdmin, async (req, res, next) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(req.params.id, {
        $set: req.body
      });
      res.json(quiz);
    } catch (err) {
      next(err);
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Delete a quiz section.
 *     description: Only Admin
 *     responses:
 *       '204':
 *          description: Successful
 */
router.delete("/:id", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw new ApiError(httpStatus.NOT_FOUND, "Quiz section not found");
    }

    await quiz.remove();
    res.json({ msg: "Quiz section removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
