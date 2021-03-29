const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const brain = require("../../services/ml/brain");
const config = require("config");
const conclusion = config.get("Customer.conclusion");

const Quiz = require("../../models/Quiz");
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
module.exports = router;


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
router.post('/answers', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // const {input, plan} = req.body;
      // const input=req.body.map(question => question.options.map(option=> option.selected));
      const symptoms=[01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1];
      const symptom = brain(symptoms);
      const conclusions=[];
      Object.entries(symptom).forEach(([key, value]) => {
        // do something with key and val
        
        if(value>=0.1){

          conclusions.push(conclusion[key])
          // const concl = conclusion.map(item => {
          //   if(Object.key(item) === key){
          //     return item.value;
          //   }
          // })
          // conclusions.push(concl);
        }
      });

      const {gender, age, weight, height, activity, weightChange} = input;

      let bmr = 10*weight + 6.25*height - 5*age;
      if(gender === 1) bmr+=5;
      else bmr-=161;
      
      let tdee;

      if(activity === 1 ) tdee=1.2*bmr;           // Sedentary/Couch Potato
      else if(activity === 2 ) tdee=1.375*bmr;    // Light Exercise/Somewhat Active
      else if(activity === 3 ) tdee=1.55*bmr;     // Moderate Exercise/Average Activity
      else if(activity === 4 ) tdee=1.725*bmr;    // Active Individuals/Very Active
      else if(activity === 5 ) tdee=1.9*bmr;      // Extremely Active Individuals/Extremely Active

      let calorie;

      if(weightChange===1) calorie=tdee+250;
      else if(weightChange===-1) calorie=tdee-500;
      else if(weightChange===0) calorie=tdee;

      const result = [conclusions, calorie];

      console.log(conclusions);
      res.status(404).json(result);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
