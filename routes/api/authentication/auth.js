const express = require('express');
const googleOAuth = require('../../../services/utils/googleOAuth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../../models/User');
const auth = require('../../../middleware/auth');
const { check, validationResult } = require('express-validator');
const { sendEmailWithNodemailer } = require("../../../services/utils/nodeMailer");

const router = express.Router();

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Post api/users
//@desc    Register user
//@access  Public


/**
 * @swagger
 * /api/auth/:
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
 router.post("/",
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
      let user = await User.findOne({ "local.email": email });
      console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        local: {
          firstName,
          lastName,
          email,
          password,
        },
      });

      // Encrypt the password
      const salt = await bcrypt.genSalt(10);

      user.local.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 }, //time
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

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
      let user = await User.findOne({ "local.email": email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      const token = jwt.sign(
        { firstName, lastName, email, password },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

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
          let user = await User.findOne({ "local.email": email });
          if (user) {
            return res
              .status(400)
              .json({ errors: [{ msg: "User already activated." }] });
          }
    
          user = new User({
            local: {
              firstName,
              lastName,
              email,
              password,
            },
          });
    
          // Encrypt the password
          const salt = await bcrypt.genSalt(10);
    
          user.local.password = await bcrypt.hash(password, salt);
    
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


router.put('/forgot-password', async (req , res) => {
  const { email } = req.body;

  User.findOne({ "local.email": email }, (err, user) => {
    if (err || !user) {
        return res.status(400).json({
            error: 'User with this email does not exist'
        });
    }

    const token = jwt.sign({ _id: user._id, firstName: user.local.firstName, lastName: user.local.lastName }, process.env.JWT_RESET_PASSWORD, {
        expiresIn: '10m'
    });

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

    return user.updateOne({ "local.resetPasswordLink": token }, (err, success) => {
        if (err) {
            console.log('RESET PASSWORD LINK ERROR', err);
            return res.status(400).json({
                error: 'Database connection error on user\'s forgot password request'
            });
        } else {
          sendEmailWithNodemailer(req, res, emailData);

          res.json({
            message: `Password reset link has been sent to ${email}.`
          });
        }
    });
});

});

router.put('/reset-password', async (req , res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
        if (err) {
            return res.status(400).json({
                error: 'Expired link. Try again'
            });
        }

        User.findOne({ "local.resetPasswordLink":resetPasswordLink }, async (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Something went wrong. Try later'
                });
            }

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);

            user.local.password = await bcrypt.hash(newPassword, salt);
            user.local.resetPasswordLink = "";

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
 * /api/user:
 *   post:
 *     tags:
 *       - user
 *     summary: Login a user.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: 
 *     responses:
 *       '200':
 *          description: Successful
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
      let user = await User.findOne({"local.email": email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.local.password);

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

      const { id, local } = user;
      const { firstName, lastName } = local;

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

router.post('/google', async (req, res) => {
    
    try {
      console.log("wowo")
        const tokenId = req.body.tokenId;
        const profile = await googleOAuth.getProfileInfo(tokenId);
        console.log(profile);

        const newUser = new User();
        newUser.google.id = profile.sub;
        newUser.google.name = profile.name;
        newUser.google.firstName = profile.given_name;
        newUser.google.lastName = profile.family_name;
        newUser.google.email = profile.email;
      
        
        // const user = await newUser.save();
        console.log(newUser);

        res.json( newUser );
      } catch (e) {
        console.log(e);
        res.status(401).send();
      }
});


module.exports = router;

// const express = require("express");
// const router = express.Router();
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// const User = require('../../models/User');
// // Use the GoogleStrategy within Passport.
// //   Strategies in Passport require a `verify` function, which accept
// //   credentials (in this case, an accessToken, refreshToken, and Google
// //   profile), and invoke a callback with a user object.
// passport.use(new GoogleStrategy({
//     clientID: "496363927715-f6n858u4d6l7lin1la1hi5v4i9b8mgn1.apps.googleusercontent.com",
//     clientSecret: "BDGOuRb0u2u04TrHLdy0tM2d",
//     callbackURL: "http://localhost:8000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOne({'google.id': profile.id}, function(err, user) {
//       const {email, firstName, lastName} = profile._json;
//       if (err) return done(err);
//       if(user) return done(null, user);
//       else{
//         const newUser=new User();
//         newUser.google.id = profile.id;
//         newUser.google.token = accessToken;
//         newUser.google.name = profile.displayName;
//         newUser.google.email = profile.emails[0].value;

//         // newUser.save(function(err){
//         //   if(err) throw err;
//         //   return done(null, newUser);
//         // })
//         newUser.save();
//         console.log(newUser)
//       }
//     });
//   }
// ));


// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
// });

// module.exports=router;