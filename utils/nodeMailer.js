const nodeMailer = require("nodemailer");
require("dotenv").config();

exports.sendEmailWithNodemailer = async (emailData) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      pass: process.env.NODEMAILER_PASSWORD, // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED EARLIER
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  // return transporter
  //   .sendMail(emailData)
  //   .then((info) => {
  //     console.log(`Message sent: ${info.response}`);
  //     // return res.json({
  //     //   message: `Activation link has been sent to your email. Follow the instructions there to activate your account`,
  //     // });
  //   })
  //   .catch((err) => {
  //     console.log(`Problem sending email: ${err}`);
  //     next(err);
  //   });

  await transporter.sendMail(emailData);
};
