const express = require("express");
const googleOAuth = require("../../../utils/googleOAuth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const User = require("../../../models/User");
const { check, validationResult } = require("express-validator");
const { sendEmailWithNodemailer } = require("../../../utils/nodeMailer");
const role = require("../../../utils/role");
const { IsAdmin, verifyToken, IsUser } = require("../../../middleware/auth");
const ApiError = require("../../../utils/ApiError");
const httpStatus = require("http-status");
const logger = require("../../../config/logger");
const { BAD_REQUEST, UNAUTHORIZED } = require("http-status");
const router = express.Router();
const { validate } = require("../../../middleware/validate");
const { generateHashedPass } = require("../../../services/core/auth/authService");
const { startPhasePlan } = require("../../../services/core/user/phaseService");

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
 *         description: jwt authentication token
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
router.get("/", verifyToken, IsUser, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
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
router.post(
  "/signup",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      
      const { firstName, lastName, email, password } = req.body;

      // See if the user exists
      let user = await User.findOne({ email: email });
      if (user) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already exists")
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
      await sendEmailWithNodemailer(emailData);

      res.json({
        message: `Activation link has been sent to ${email}. Follow the instructions there to activate your account.`,
      });
    } catch (err) {
      next(err);
    }
  }
);


router.post("/account-activation-after-signup", async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Token required in request body."
      );
    } else {
      let decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

      const { firstName, lastName, email, password } = decoded;

      // See if the user exists
      let user = await User.findOne({ email });
      if (user) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already activated.");
      }

      user = new User({
        firstName,
        lastName,
        email,
        account: {
          local: {
            password,
          },
        },
      });

      // Encrypt the password
      user.account.local.password = await generateHashedPass(password);

      //Saving user in DB
      await user.save();

      res.json({
        message: "Signup success. Please login to continue.",
      });
    }
  } catch (error) {
    next(error);
  }
});


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
 *                 example: jwt account activation token
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
 *                  example: Signup success. Please login to continue.
 */
router.post("/account-activation", async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Token required in request body."
      );
    } else {
      let decoded = await jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

      const { firstName, lastName, email } = decoded;

      // See if the user exists
      let user = await User.findOne({ email });
      if (user.isActivated) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already activated.");
      }

      //Activate user's account in DB
      user.account.isActivated=true;

      // Encrypt the password
      user.account.local.password = await generateHashedPass(password);

      //Saving user in DB
      await User.findByIdAndUpdate(user.id, user);
      
      //Starting Phase Plan
      await startPhasePlan(user);

      res.json({
        message: "Account activated successfully. Please login to continue.",
      });
    }
  } catch (error) {
    next(error);
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
router.put("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(BAD_REQUEST, "User with this email does not exist");
    }

    //Generating token for changing Password
    const token = await jwt.sign(
      { id: user.id, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m",
      }
    );

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
        `,
    };

    await user.updateOne({ "account.local.resetPasswordLink": token });

    //Sending mail to user with forgot password link
    await sendEmailWithNodemailer(emailData);

    res.json({
      message: `Password reset link has been sent to ${email}.`,
    });
  } catch (error) {
    next(error);
  }
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
router.put("/reset-password", async (req, res, next) => {
  try {
    const { resetPasswordLink, newPassword } = req.body;

    if (!resetPasswordLink) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "reset Password token required in request body"
      );
    }

    let decoded = jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD
    );

    let user = await User.findOne({
      "account.local.resetPasswordLink": resetPasswordLink,
    });

    // Encrypt the password
    user.account.local.password = await generateHashedPass(password);
    user.account.local.resetPasswordLink = "";
    await User.findByIdAndUpdate(user.id, user);

    res.json({
      message: `Great! Your password is changed successfully. Now you can login with your new password`,
    });
  } catch (error) {
    next(error);
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
router.post(
  "/login",
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
  validate,
  async (req, res, next) => {

    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });

      if (!user || !user.account.local.password) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Credentials");
      }

      const isMatch = await bcrypt.compare(
        password,
        user.account.local.password
      );

      if (!isMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Credentials");
      }

      const payload = {
        user: {
          id: user.id,
        },
        role: role.User,
      };

      const { id, firstName, lastName } = user;

      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: {
          id,
          firstName,
          lastName,
          email,
        },
      });
    } catch (err) {
      next(err);
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
 *                examples: token generated by google Oauth
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
router.post("/google-login", async (req, res, next) => {
  try {
    const tokenId = req.body.tokenId;

    //get user's google profile data
    const profile = await googleOAuth.getGoogleProfileData(tokenId);
    // console.log(profile);

    const { sub, name, given_name, family_name, email, email_verified } =
      profile;

    if (!email_verified) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Google login failed. Try again"
      );
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.account.google.id) {
        user.account.google.id = sub;
        await user.save();
      }

      const payload = {
        user: {
          id: user.id,
        },
        role: role.User,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      const { id, firstName, lastName, email } = user;
      return res.json({
        token,
        user: { id, firstName, lastName, email },
      });
    } else {
      const newUser = new User();
      newUser.account.isActivated = true;
      newUser.account.google.id = sub;
      newUser.firstName = given_name;
      newUser.lastName = family_name;
      newUser.email = email;

      await newUser.save();

      const payload = {
        user: {
          id: user.id,
        },
        role: role.User,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      const { id, firstName, lastName, email } = user;
      return res.json({
        token,
        user: { id, firstName, lastName, email },
      });
    }
  } catch (e) {
    next(e);
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
 *                examples: userId generated by facebook
 *              token:
 *                type: string
 *                examples: access token generated by facebook
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
router.post("/facebook-login", (req, res, next) => {
  console.log("FACEBOOK LOGIN REQ BODY", req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,first_name,last_name,email&access_token=${accessToken}`;

  return fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      // console.log(response);
      const { email, first_name, last_name } = response;
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          const payload = {
            user: {
              id: user.id,
            },
            role: role.User,
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          const { id, email, firstName, lastName } = user;
          return res.json({
            token,
            user: { id, email, firstName, lastName },
          });
        } else {
          user = new User({
            account:{
              isActivated: true,
              facebook: {
                id: userID
              },
            },
            firstName: first_name,
            lastName: last_name,
            email,
          });
          user.save((err, user) => {
            if (err) {
              console.log("ERROR FACEBOOK LOGIN ON USER SAVE", err);
              throw new ApiError(httpStatus.BAD_REQUEST, "User signup failed with facebook");
            }
            const payload = {
              user: {
                id: user.id,
              },
              role: role.User,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { id, email, firstName, lastName } = user;
            return res.json({
              token,
              user: { id, email, firstName, lastName },
            });
          });
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
