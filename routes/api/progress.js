const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Progress = require('../../models/Progress');
const {verifyToken, IsAdmin, IsUser} = require("../../middleware/auth");
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
router.post('/', verifyToken, async (req, res) => {
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
  
module.exports = router;