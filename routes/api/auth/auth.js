const express = require('express');
const googleOAuth = require('../../../utils/googleOAuth');
const User = require('../../../models/User');

const router = express.Router();

router.post('/google', async (req, res) => {
    try {
      console.log("wowo")
        const code = req.body.code;
        const profile = await googleOAuth.getProfileInfo(code);
        const newUser = new User();
        newUser.google.id = profile.sub;
        newUser.google.name = profile.name;
        newUser.google.firstName = profile.given_name;
        newUser.google.lastName = profile.family_name;
        newUser.google.email = profile.email;
      
        
        const user = await newUser.save();
        console.log(newUser);

        res.json( user );
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