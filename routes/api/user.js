const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

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

        var {firstName, lastName, email, password} = req.body;

        try{
            // See if the user exists
            let user = await User.findOne({'local.email': email});

            if(user){
                return res.status(400).json({errors: [{msg: 'User already exists'} ] });
            }

            // Get users gravatar

            // const avatar = gravatar.url(email, {
            //     s: '200',
            //     r: 'pg',
            //     d: 'mm'
            // });

            user = new User({
                'local':{
                    firstName,
                    lastName,
                    email,
                    password
                }
            });

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

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

// @route    GET /api/admin/user
// @desc     Get all users
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
 router.get('/:id/progress', async (req, res) => {
    try {
      const Progress = await Progress.find({userID: req.params.id});
      res.json(Progress);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

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
router.get('/:userId/progress', async (req, res) => {
    try {
      const progress = await Progress.find(req.params.id);
      res.json(progress);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/user/:id/meal
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
    const user = User.findById(req.params.id);
    const dcalr=user.healthrecords.desireddCalories;
    const dpr=user.healthrecords.desiredNutrients.proteins;
    const dfr=user.healthrecords.desiredNutrients.fats;
    const dcr=user.healthrecords.desiredNutrients.carbs;
    const bCal = 0.3*dcalr;
    const lCal = 0.4*dcalr;
    const dCal = 0.3*dcalr;

    const bMeals = await Meal.find({mealTime: "breakfast"});
    const lMeals = await Meal.find({mealTime: "lunch"});
    const dMeals = await Meal.find({mealTime: "dinner"});

    
    
    bMeals.forEach(b => {
      lMeals.forEach(l => {
        dMeals.forEach(d => {
          const pErr = Math.pow(abs((b.nutriValues.protein + l.nutriValues.protein + d.nutriValues.protein)-dpr),2);
          const fErr = Math.pow(abs((b.nutriValues.fat + l.nutriValues.fat + d.nutriValues.fat)-dfr),2);
          const cErr = Math.pow(abs((b.nutriValues.carb + l.nutriValues.carb + d.nutriValues.carb)-dcr),2);
          const calErr = Math.pow(abs((b.calories + l.calories + d.calories)-dcalr),2);
          const tErr=pErr+fErr+cErr+calErr;
          const mealCombo = {
            b: b.id,
            l: l.id,
            d: d.id,
            err: tErr
          }
          console.log(mealCombo);
        });
      });
    });
    
    res.json(meals);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;