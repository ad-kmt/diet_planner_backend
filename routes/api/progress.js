const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const Progress = require('../../models/Progress');
const auth = require("../../middleware/auth");
const User = require('../../models/User');


//@route   Post api/users/progress
//@desc    User Daily Progress
//@access  Public
/**
 * @swagger
 * /api/progress:
 *   post:
 *     tags:
 *       - progress
 *     summary: Submit Daily Progress.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *progress
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', auth, async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const newProgress = new Progress(req.body);
  
        await newProgress.save();
        let user = new User();
        user.height = newProgress.height;
        user.weight = newProgress.weight;
        user.activity = newProgress.activity;
        await User.findByIdAndUpdate(req.user.id, user);
        res.json(progress);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
);


/**
 * @swagger
 * /api/progress:
 *   get:
 *     tags:
 *       - progress
 *     summary: Get user's Progress.
 *     responses:
 *       '200':
 *          description: Successful
*/
router.get('/', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const progress = await Progress.find({userId: req.user.id});
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @swagger
 * /api/progress/{progressId}:
 *   put:
 *     tags:
 *       - progress
 *     parameters:
 *       - in: path
 *         name: progressId
 *         schema:
 *           type: string
 *     summary: Update a progress.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: 
 *     responses:
 *       '200':
 *          description: Successful
 */

router.put("/:progressId", auth, async (req, res) => {
  try {
    const progress = await Progress.findByIdAndUpdate(req.params.progressId, {
      $set: req.body
    }, (error, data) => {
      if (error) {
        console.log(error)
        return next(error);
      } else {
        // res.json(data)
        console.log('Progress updated successfully!')
      }
    });
    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;