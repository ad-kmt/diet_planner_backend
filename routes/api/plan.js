const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const Plan = require('../../models/Plan');
 
// @route    GET /api/plan
// @desc     Get all plans
// @access   Public
/**
 * @swagger
 * /api/plan:
 *  get:
 *    tags:
 *      - plan
 *    description: Use to get all plans
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
      const plans = await Plan.find();
      res.json(plans);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/plan:
 *   post:
 *     tags:
 *       - plan
 *     summary: Create a plan.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *meal
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
      const newPlan = new Plan({
        name: req.body.name,
        displayPrice: req.body.displayPrice,
        onsalePrice: req.body.onsalePrice,
        discount: req.body.discount,
        duration: req.body.duration
      });

      const plan = await newPlan.save();

      res.json(plan);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;