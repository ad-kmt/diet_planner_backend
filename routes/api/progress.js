const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
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
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Submit Daily Progress.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *progress
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', verifyToken, async (req, res, next) => {
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
        await User.findByIdAndUpdate(req.body.userId, user);
        res.json(progress);
      } catch (err) {
        next(err);
      }
    }
);


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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Update a progress.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: 
 *     responses:
 *       '200':
 *          description: Successful
 */

router.put("/:progressId", verifyToken, async (req, res, next) => {
  try {
    const progress = await Progress.findByIdAndUpdate(req.params.progressId, {
      $set: req.body
    });
    res.json(progress);
  } catch (err) {
    next(err);
  }
});

module.exports = router;