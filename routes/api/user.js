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
 *       201:
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

// @route    DELETE api/posts/:id
// @desc     Delete a post
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

module.exports = router;