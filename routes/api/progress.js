const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const UserProgress = require('../../models/UserProgress');

// @route    GET /api/user
// @desc     Get user progress
// @access   Private
/**
 * @swagger
 * /api/user:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get user progress
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *user
 *      '404':
 *          description: Not found
 */
 router.get('/', async (req, res) => {
  try {
    const userProgress = await UserProgress.find({userID: req.user.id});
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Post api/users/progress
//@desc    User Daily Progress
//@access  Public
/**
 * @swagger
 * /api/user:
 *   post:
 *     tags:
 *       - user
 *     summary: Submit Daily Progress.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *userprogress
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
        const user = await UserProgress.findById(req.user.id);
  
        const newProgress = new UserProgress({
          user: user.id,
          progress: req.body
        });
  
        const progress = await newProgress.save();
  
        res.json(progress);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
);
  
