const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const { getMeals } = require('../../services/core/mealPlanner');
const Meal = require('../../models/Meal');
const Payment = require('../../models/Payment');
const Progress = require('../../models/Progress');

//@route   Post api/users
//@desc    Register user
//@access  Public

/**
 * @swagger
 * /api/user:
 *   post:
 *     tags:
 *       - user
 *     summary: Create a user.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: *userSignUp
 *     responses:
 *       '200':
 *          description: Successful
*/
router.post('/', [
        check('firstName', 'First name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {firstName, lastName, email, password} = req.body;

        try{
            // See if the user exists
            let user = await User.findOne({"local.email": email});
            console.log(user);
            if(user){
                return res.status(400).json({errors: [{msg: 'User already exists'} ] });
            }

            
            user = new User({
              local:{
                  firstName,
                  lastName,
                  email,
                  password
              }
            });

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);

            user.local.password = await bcrypt.hash(password, salt);

            await user.save();

            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                {expiresIn: 360000}, //time
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch(err){
            console.log(err.message);
            res.status(500).send('Server error');
        }
    }
);

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
router.get('/:userId/progress', async (req, res) => {
    try {
      const progress = await Progress.find({userId: req.params.userId});
      res.json(progress);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


/**
 * @swagger
 * /api/user/:id/meal:
 *  get:
 *    summary: Get meal plan for a user. (Incomplete api)
 *    tags:
 *      - meal
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
 router.get('/:id/meal', async (req, res) => {
  try {
    getMeals(req.params.id);
    res.status(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
 router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
 router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
 router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
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
 router.get('/:userId/payment', async (req, res) => {
  try {
    Payment
    const userPayments = await Payment.find({userId: req.params.userId});
    res.json(userPayments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;