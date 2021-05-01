const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const { verifyToken, IsAdmin } = require("../../middleware/auth");

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
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     description: Only Admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *plan
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not found
*/
router.post('/', verifyToken, IsAdmin, async (req, res) => {
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Update a plan.
 *     description: Only Admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *plan
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not found
 */
  router.put("/:planId", verifyToken, IsAdmin, async (req, res) => {
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
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Delete a plan.
 *     description: Only Admin
 *     responses:
 *       '204':
 *          description: Successful
 *       '404':
 *          description: Not found
 */
 router.delete("/:planId", verifyToken, IsAdmin, async (req, res) => {
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