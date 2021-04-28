const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { getMeals } = require("../../services/core/mealPlanner");
const Payment = require("../../models/Payment");
const Progress = require("../../models/Progress");
const { verifyToken, IsAdmin } = require("../../middleware/auth");


// @access   Private
/**
 * @swagger
 * /api/user/{userId}/progress:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *    description: Use to get user's progress data
 *    summary: Get user's progresses
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
router.get("/:userId/progress", verifyToken ,async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/user/{userId}/meal:
 *  get:
 *    summary: Get meal plan for a user.
 *    tags:
 *      - user
 *    parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *    description: Use to get meal plan for a user
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items: *meal
 */
router.get("/:id/meal", verifyToken, async (req, res) => {
  try {
    //get basic meal plan for user
    getMeals(req.params.id);
    res.status(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @access   Public
/**
 * @swagger
 * /api/user:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get all users
 *    summary: Get all users
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
router.get("/", verifyToken, IsAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @swagger
 * /api/user/{userId}:
 *  get:
 *    tags:
 *      - user
 *    parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
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
 router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     tags:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     summary: Update's user data.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *user
 *     responses:
 *       '200':
 *          description: Successful
 */
// router.put("/:id", auth, async (req, res) => {
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName} = req.body;

    User.findById(req.params.id, (err, user) => {
      if (err || !user) {
          return res.status(400).json({
              error: 'User not found'
          });
      }
      if (!firstName) {
          return res.status(400).json({
              error: 'First Name is required'
          });
      } else {
          user.firstName = firstName;
      }

      if (lastName) {
        user.lastName = lastName;
      }

      console.log(user);

      user.save((err, updatedUser) => {
          if (err) {
              console.log('USER UPDATE ERROR', err);
              return res.status(400).json({
                  error: 'User update failed'
              });
          }
          // console.log(updatedUser);
          const { id, firstName, lastName, email } = updatedUser;
          res.json({
              id,
              firstName,
              lastName,
              email
          });
        });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
 *      -   in: path
 *          name: userId
 *          required: true
 *          schema:
 *              type: ObjectId
 *          description: userId
 *    description: Use to delete a user with id in URI
 *    responses:
 *      '204':
 *        description: user deleted successfully
 */
 router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await user.remove();

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
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
 *      -   in: path
 *          name: userId
 *          required: true
 *          schema:
 *              type: string
 *          description: userId
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
router.get("/:userId/payment", verifyToken, async (req, res) => {
  try {
    const userPayments = await Payment.find({ userId: req.params.userId });
    res.json(userPayments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
