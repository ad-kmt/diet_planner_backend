const User = require("../../../models/User");
const ApiError = require("../../../utils/ApiError");
const { sendEmailWithNodemailer } = require("../../../utils/nodeMailer");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
require("dotenv").config();

exports.generateHashedPass = async (password) => {
  // Encrypt the password
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

exports.sendAccountActivationLink = async (user) => {
    const { firstName, lastName, email } = user;

      // See if the user exists
      user = await User.findOne({ email: email });
      if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, `User with email: ${email} doesn't exist`)
      }

      //Generating token for Email Activation
      const token = jwt.sign(
        { firstName, lastName, email },
        process.env.JWT_ACCOUNT_ACTIVATION
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
}