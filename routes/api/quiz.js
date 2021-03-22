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
 *    description: Use to get all quiz questions.
 *    responses:
 *      '200':
 *        description: A successful response.
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

// @route    POST api/quiz
// @desc     post quiz data
// @access   Private
router.post('/', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {symptoms, input} = req.body;
      // const input=req.body.map(question => question.options.map(option=> option.selected));
      // const input=[01,01,1,01,01,1,01,01,01,01,01,01,01,01,1,1,01,1,1,1,01,01,01,1,1,1,1,01,01,01,01,01,01,01,1,01,01,01,01,01,01,01,1,1,1,1,1,01,1,1,1,01,1,01,01,01,01,01,01,1,01,1,01,01,01,01,01,01,01,01,01,1,1,1,1,1,1];
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

      if(activity === 1 ) tdee=1.2*bmr;
      else if(activity === 2 ) tdee=1.375*bmr;
      else if(activity === 3 ) tdee=1.55*bmr;
      else if(activity === 4 ) tdee=1.725*bmr;
      else if(activity === 5 ) tdee=1.9*bmr;

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
