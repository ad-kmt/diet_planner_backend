const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const Plan = require('../../models/Plan');
const adminAuth = require('../../middleware/adminAuth');
 
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
 *    summary: Get all plans
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: 
 *                  type: array
 *                  items: *plan
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
 *           schema: *plan
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', adminAuth, async (req, res) => {
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

/**
 * @swagger
 * /api/plan/{planId}:
 *   put:
 *     tags:
 *       - plan
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *     summary: Update a plan.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: 
 *     responses:
 *       '200':
 *          description: Successful
 */
// router.put("/:id", auth, async (req, res) => {
  router.put("/:planId", adminAuth, async (req, res) => {
    try {
      const plan = await Plan.findByIdAndUpdate(req.params.planId, {
        $set: req.body
      }, (error, data) => {
        if (error) {
          console.log(error)
          return next(error);
        } else {
          // res.json(data)
          console.log('Plan updated successfully!')
        }
      });
      await plan.save();
      res.json(plan);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
});

/**
 * @swagger
 * /api/plan/{planId}:
 *   delete:
 *     tags:
 *       - plan
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *     summary: Delete a plan.
 *     responses:
 *       '204':
 *          description: Successful
 */
 router.delete("/:planId", adminAuth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ msg: "Plan not found" });
    }

    await plan.remove();
    res.json({ msg: "Plan removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;