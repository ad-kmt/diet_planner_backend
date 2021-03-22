const express = require("express");
const router = express.Router();
require("dotenv").config();
const passport = require("passport");
const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../../../models/User');

passport.use(new FacebookStrategy({
    clientID: "4096359277040803",
    clientSecret: "5481e83c1bfc4174ae2dcc0be8f55f02",
    callbackURL: "http://localhost:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'facebook.id': profile.id}, function(err, user) {
      const {email, firstName, lastName} = profile._json;
      if (err) return done(err);
      if(user) return done(null, user);
      else{
        const newUser=new User();
        newUser.facebook.id = profile.id;
        newUser.facebook.token = accessToken;
        newUser.facebook.firstName = firstName;
        newUser.facebook.lastName = lastName;
        newUser.facebook.email = email;

        newUser.save(function(err){
          if(err) throw err;
          return done(null, newUser);
        })
      }
    });
  }
));

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/' }));

module.exports=router;