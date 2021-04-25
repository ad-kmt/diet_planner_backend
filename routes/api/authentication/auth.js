const express = require('express');
const googleOAuth = require('../../../services/utils/googleOAuth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const fetch = require('node-fetch');


const User = require('../../../models/User');
const auth = require('../../../middleware/auth');
const { check, validationResult } = require('express-validator');
const { sendEmailWithNodemailer } = require("../../../services/utils/nodeMailer");
const passport = require('passport');

const router = express.Router();

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
/**
 * @swagger
 * /api/auth:
 *   get:
 *     tags:
 *       - auth
 *     summary: Get user by token.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *          type: string
 *         required: true
 *     responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *              schema:
 *                type: array
 *                items: *user
 *      '404':
 *          description: Not found
*/
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Post api/auth/signup
//@desc    Register user
//@access  Public

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a user.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *               firstName: 
 *                 type: string
 *               lastName: 
 *                 type: string
 *               email: 
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  example: Activation link has been sent to user@email.com Follow the instructions there to activate your account.
*/
router.post("/signup",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({ "email": email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      //Generating token for Email Activation
      const token = jwt.sign(
        { firstName, lastName, email, password },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

      //Generating Email Body
      const emailData = {
        from: process.env.NODEMAILER_EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
        to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
        subject: "ACCOUNT ACTIVATION LINK",
        html: `
                  <h1>Please use the following link to activate your account</h1>
                  <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                  <hr />
                  <p>This email may contain sensitive information</p>
                  <p>${process.env.CLIENT_URL}</p>
              `,
      };

      //Sending Mail to User email-ID
      sendEmailWithNodemailer(req, res, emailData);

      res.json({
        message: `Activation link has been sent to ${email}. Follow the instructions there to activate your account.`
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

/**
 * @swagger
 * /api/auth/account-activation:
 *   post:
 *     tags:
 *       - auth
 *     summary: Activate User's Account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:          
 *                 type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  example: Signup success. Please login to continue.
*/
router.post("/account-activation", async (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      async function (err, decoded) {
        if (err) {
          console.log("JWT VERIFY IN ACC ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Sign up again",
          });
        }

        const { firstName, lastName, email, password } = jwt.decode(token);

        try {
          // See if the user exists
          let user = await User.findOne({ email });
          if (user) {
            return res
              .status(400)
              .json({ errors: [{ msg: "User already activated." }] });
          }
    
          user = new User({
            firstName,
            lastName,
            email,
            account:{
              local: {
                password,
              },
            },
          });
    
          // Encrypt the password
          const salt = await bcrypt.genSalt(10);
    
          user.account.local.password = await bcrypt.hash(password, salt);
    
          //Saving user in DB
          await user.save();
          
          res.status(200).json({
            message: "Signup success. Please login to continue."
          })
                    
        } catch (err) {
          console.log(err.message);
          res.status(500).send("Server error");
        }
      }
    );
  } else {
    res.status(400).json({
      message: "Something went wrong. Try again"
    })
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   put:
 *     tags:
 *       - auth
 *     summary: Forgot Password.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  example: Password reset link has been sent to user@email.com
 */
router.put('/forgot-password', async (req , res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
        return res.status(400).json({
            error: 'User with this email does not exist'
        });
    }

    //Generating token for changing Password
    const token = jwt.sign({ id: user.id, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_RESET_PASSWORD, {
        expiresIn: '10m'
    });

    //Creating email
    const emailData = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: `Password Reset link`,
        html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `
    };

    return user.updateOne({ "account.local.resetPasswordLink": token }, (err, success) => {
        if (err) {
            console.log('RESET PASSWORD LINK ERROR', err);
            return res.status(400).json({
                error: 'Database connection error on user\'s forgot password request'
            });
        } else {

          //Sending mail to user with forgot password link
          sendEmailWithNodemailer(req, res, emailData);

          res.json({
            message: `Password reset link has been sent to ${email}.`
          });
        }
    });
});

});

/**
 * @swagger
 * /api/auth/reset-password:
 *   put:
 *     tags:
 *       - auth
 *     summary: Reset Password.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              resetPasswordLink:
 *                type: string
 *              newPassword:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  example: Great! Your password is changed successfully
 */
router.put('/reset-password', async (req , res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {

    //verifying forgot-password token
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
        if (err) {
            return res.status(400).json({
                error: 'Expired link. Try again'
            });
        }

        User.findOne({ "account.local.resetPasswordLink":resetPasswordLink }, async (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Something went wrong. Try later'
                });
            }

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);

            user.account.local.password = await bcrypt.hash(newPassword, salt);
            user.account.local.resetPasswordLink = "";

            user.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Error resetting user password'
                    });
                }
                res.json({
                    message: `Great! Your password is changed successfully. Now you can login with your new password`
                });
            });
        });
    });
  }
});

//@route   Post api/users
//@desc    Login user
//@access  Public
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login a user.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                token:
 *                  type: string
 *                user:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    firstName:
 *                      type: string
 *                    lastName:
 *                      type: string
 *                    email:
 *                      type: string
*/
router.post( '/login',
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.account.local.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      const { id, firstName, lastName } = user;

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id,
              firstName,
              lastName,
              email
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Google Login.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              tokenId:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                token:
 *                  type: string
 *                user:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    firstName:
 *                      type: string
 *                    lastName:
 *                      type: string
 *                    email:
 *                      type: string
*/
router.post('/google-login', async (req, res) => {
  try {
    
    const tokenId = req.body.tokenId;

    //get user's google profile data
    const profile = await googleOAuth.getGoogleProfileData(tokenId);
    // console.log(profile);

    const { sub, name, given_name, family_name, email, email_verified } = profile;


    if (email_verified) {
      User.findOne({ email }).exec(async (err, user) => {
          if (user) {
              if(!user.account.google.id){
                user.account.google.id = sub;
                await user.save();
              }
              const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
              const { id, firstName, lastName, email } = user;
              return res.json({
                  token,
                  user: { id, firstName, lastName, email }
              });
          } else {
              const newUser = new User();
              newUser.account.google.id = sub;
              newUser.firstName = given_name;
              newUser.lastName = family_name;
              newUser.email = email;

              newUser.save((err, data) => {
                  if (err) {
                      console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                      return res.status(400).json({
                          error: 'User signup failed with google'
                      });
                  }
                  const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                  const { id, firstName, lastName, email } = data;
                  return res.json({
                      token,
                      user: { id, firstName, lastName, email }
                  });
              });
          }
      });
    } else {
        return res.status(400).json({
            error: 'Google login failed. Try again'
        });
      }
  } catch (e) {
    console.log(e);
    res.status(401).send();
  }
});

/**
 * @swagger
 * /api/auth/facebook-login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Facebook Login.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *              token:
 *                type: string
 *     responses:
 *       '200':
 *          description: Successful
 *       content:
 *          application/json:
 *              schema:
 *               type: object
 *               properties:
 *                token:
 *                  type: string
 *                user:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    email:
 *                      type: string
 *                    firstName:
 *                      type: string
 *                    lastName:
 *                      type: string
*/
router.post('/facebook-login', (req, res) => {
  console.log('FACEBOOK LOGIN REQ BODY', req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,first_name,last_name,email&access_token=${accessToken}`;

  return (
      fetch(url, {
          method: 'GET'
      })
          .then(response => response.json())
          .then(response => {
              // console.log(response);
              const { email, first_name, last_name } = response;
              User.findOne({ email }).exec((err, user) => {
                  if (user) {
                      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                      const { id, email, firstName, lastName } = user;
                      return res.json({
                          token,
                          user: { id, email, firstName, lastName }
                      });
                  } else {
            
                      user = new User({
                        firstName: first_name,
                        lastName: last_name, 
                        email, 
                      });
                      user.save((err, data) => {
                          if (err) {
                              console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                              return res.status(400).json({
                                  error: 'User signup failed with facebook'
                              });
                          }
                          const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                          const { id, email, firstName, lastName } = data;
                          return res.json({
                              token,
                              user: { id, email, firstName, lastName }
                          });
                      });
                  }
              });
          })
          .catch(error => {
              res.json({
                  error: 'Facebook login failed. Try later'
              });
          })
  );
});

module.exports = router;