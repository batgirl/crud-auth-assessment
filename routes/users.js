var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/test');
var Users = db.get('users');
var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.render('users', {user: req.session.user});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', {title: "Sign Up", errors: []});
});

router.post('/signup', function(req, res, next) {
  var errors = [];
  Users.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if (user) errors.push("Email is already in use");
    if (!req.body.email) errors.push("Email cannot be blank");
    if (!req.body.password) errors.push("Password cannot be blank");
    if (req.body.email.indexOf("@") === -1 || req.body.email.indexOf(".") === -1) errors.push("Must be a valid email");
    if (errors.length) res.render('signup', {title: "Try Again", errors: errors});
    else {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          Users.insert({email: req.body.email.toLowerCase(), password: hash}, function(err, user) {
            req.session.user = user;
            res.redirect('/users');
          })
        })
      })    
    }
  })
});

router.get('/signin', function(req, res, next) {
  res.render('signin', {title: "Sign In", errors: []});
});

router.post('/signin', function(req, res, next) {
  var errors = [];
  Users.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if (user === null) {
      errors.push("Invalid Email / Password");
      res.render('signin', {title: "Oops!", errors: errors});
    }
    if (user) {
      bcrypt.compare(req.body.password, user.password, function(err, response) {
        if (response === true) {
          req.session.user = user;
          res.redirect('/users');
        }
        else {
          errors.push("Invalid Email / Password");
          res.render('signin', {title: "Oops!", errors: errors});
        }
      }) 
    }
  })
});

router.get('/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/users');
});

module.exports = router;
