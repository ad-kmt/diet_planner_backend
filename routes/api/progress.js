const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Progress = require('../../models/Progress');
const auth = require("../../middleware/auth");


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
  
        const progress = await newProgress.save();
  
        res.json(progress);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
);
  
module.exports = router;