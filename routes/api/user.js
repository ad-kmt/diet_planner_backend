const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { getMeals } = require("../../services/core/meal/mealPlanner");
const Payment = require("../../models/Payment");
const Progress = require("../../models/Progress");
const { verifyToken, IsAdmin, IsUser } = require("../../middleware/auth");
const { next } = require("../../services/core/user/phaseService");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");

// @access   Private
/**
 * @swagger
 * /api/user/{userId}/progress:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to allow admin to get user's progress data
 *    summary: Get user's progresses for admin
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *progress
 *      '404':
 *          description: Not found
 */
router.get("/:userId/progress", verifyToken, async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/user/meal:
 *  get:
 *    summary: Get meal plan for a user.
 *    tags:
 *      - user
 *    parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *          type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to get meal plan for a user. Response will contain 7 arrays each representing 7 days of week containing 3 meals.
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                    type: array
 *                    items: *meal
 */
router.get("/:userId/meal", verifyToken, async (req, res, next) => {
  try {
    //get basic meal plan for user
    const mealPlan = getMeals(req.params.userId);
    res.status(200).json(mealPlan);
  } catch (err) {
    next(err);
  }
});

// @access   Public
/**
 * @swagger
 * /api/user:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    summary: Get all users
 *    description: Only Admin
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
router.get("/", verifyToken, IsAdmin, async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/user/{userId}:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *          type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to get user by id
 *    summary: Get a user
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema: *user
 *      '404':
 *          description: Not found
 */
router.get("/:userId", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/user:
 *   put:
 *     tags:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     summary: Update's user data.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *user
 *     responses:
 *       '200':
 *          description: Successful
 */
router.put("/:userId", verifyToken, async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    let user = await User.findById(req.params.userId);

    if (err || !user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (!firstName) {
      throw new ApiError(httpStatus.BAD_REQUEST, "First Name is required");
    } else {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    console.log(user);

    let updatedUser = await user.save();
    
    res.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    });
  } catch (err) {
    next(err);
  }
});

// @route    DELETE api/users/:id
// @desc     Delete a user
// @access   Private
/**
 * @swagger
 * /api/user/{userId}:
 *  delete:
 *    tags:
 *      - user
 *    summary: Remove a user
 *    parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *            type: ObjectId
 *         description: userId
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    description: Use to delete a user with id in URI
 *    responses:
 *      '204':
 *        description: user deleted successfully
 */
router.delete("/:userId", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    await user.remove();
    res.json({ msg: "User removed" });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/user/{userId}/payment:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get a user's payments
 *    summary: Get all payments of a user
 *    parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *             type: string
 *         description: userId
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *payment
 *      '404':
 *          description: Not found
 */
router.get("/:userId/payment", verifyToken, async (req, res, next) => {
  try {
    const userPayments = await Payment.find({ userId: req.params.userId });
    res.json(userPayments);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/user/{userId}/phase/next:
 *  get:
 *    tags:
 *      - user
 *    description: Use to go to next phase
 *    summary: Use to go to next phase
 *    parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *             type: string
 *         description: userId
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *    requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              phase:
 *                type: Number
 *              week:
 *                type: Number
 *              foodTest:
 *                type: String
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *payment
 *      '404':
 *          description: Not found
 */
router.post(
  "/:userId/phase/next",
  verifyToken,
  IsUser,
  async (req, res, next) => {
    try {
      let userId = req.params.userId;
      let { completedPhase, nextPhase } = req.body;

      await next(userId, completedPhase, nextPhase);
      
      let user = await User.findById(req.params.userId).select("currentPhase");
      res.status(201).json(user.currentPhase);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
