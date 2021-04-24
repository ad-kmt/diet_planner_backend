const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const { getMeals } = require("../../services/core/mealPlanner");
const Meal = require("../../models/Meal");
const Payment = require("../../models/Payment");
const Progress = require("../../models/Progress");




// @access   Private
/**
 * @swagger
 * /api/user/{userId}/progress:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get user's progress data
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
router.get("/:userId/progress", async (req, res) => {
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
 * /api/user/{id}/meal:
 *  get:
 *    summary: Get meal plan for a user. (Incomplete api)
 *    tags:
 *      - user
 *    parameters:
 *      - in: query
 *        name:
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
router.get("/:id/meal", async (req, res) => {
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
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /api/user/:id:
 *  get:
 *    tags:
 *      - user
 *    description: Use to get user by id
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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
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
 *     summary: Update's user data. (Incomplete api)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *user
 *     responses:
 *       '200':
 *          description: Successful
 */
// router.put("/:id", auth, async (req, res) => {
router.put("/:id", async (req, res) => {
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
 * /api/user/{id}:
 *  delete:
 *    tags:
 *      - user
 *    parameters:
 *      -   in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *          description: userId
 *    description: Use to delete a user with id in URI
 *    responses:
 *      '204':
 *        description: user deleted successfully
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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
router.get("/:userId/payment", async (req, res) => {
  try {
    const userPayments = await Payment.find({ userId: req.params.userId });
    res.json(userPayments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
