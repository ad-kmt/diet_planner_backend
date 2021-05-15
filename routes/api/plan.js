const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const httpStatus = require('http-status');

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
 router.get('/', async (req, res, next) => {
    try {
      const plans = await Plan.find();
      res.json(plans);
    } catch (err) {
      next(err);
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
router.post('/', verifyToken, IsAdmin, async (req, res, next) => {

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
      next(err);
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
  router.put("/:planId", verifyToken, IsAdmin, async (req, res, next) => {
    try {
      const plan = await Plan.findByIdAndUpdate(req.params.planId, {
        $set: req.body
      });
      res.json(plan);
    } catch (err) {
      next(err);
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
 router.delete("/:planId", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Plan not found" );
    }
    await plan.remove();
    res.json({ msg: "Plan removed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;