const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const brain = require('../../ml/brain');
const config = require('config');
const conclusion = config.get('Customer.conclusion');

const Quiz = require('../../models/Quiz');
// const conclusion=require('../../data/conclusion.json');

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
      // const input=req.body.map(question => question.options.map(option=> option.selected));
      const input=[0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const output = brain(input);
      const conclusions=[];
      Object.entries(output).forEach(([key, value]) => {
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
      console.log(conclusions);
      res.status(404).json(conclusions);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);