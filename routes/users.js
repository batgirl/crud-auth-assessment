var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/test');
var Users = db.get('users');
var bcrypt = require('bcrypt');

router.get('/signup', function(req, res, next) {
  if (req.session.user) res.render('index', {user: req.session.user, error: true});
  res.render('users/signInOrUp', {
    title: "Sign Up", 
    postPath: "signup", 
    link: false, 
    errors: [], 
    errEmail: "" });
});

router.post('/signup', function(req, res, next) {
  if (req.session.user) res.redirect('/');
  var errors = [];
  Users.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if (user) errors.push("Email is already in use");
    if (!req.body.email) errors.push("Email cannot be blank");
    else if (req.body.email.indexOf("@") === -1 || 
            req.body.email.indexOf(".") === -1) errors.push("Must be a valid email");
    if (!req.body.password) errors.push("Password cannot be blank");
    if (errors.length) res.render('users/signInOrUp', {
      title: "Try Again", 
      postPath: "signup", 
      link: false, 
      errors: errors, 
      errEmail: req.body.email });
    else {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          req.body.password = hash;
          Users.insert({email: req.body.email.toLowerCase(), password: req.body.password}, 
            function(err, user) {
              req.session.user = user;
              res.redirect('/');
          })
        })
      })    
    }
  })
});

router.get('/signin', function(req, res, next) {
  if (req.session.user) res.render('index', {user: req.session.user, error: true});
  res.render('users/signInOrUp', {
    title: "Sign In", 
    postPath: "signin", 
    link: true, 
    errors: [],
    errEmail: "" });
});

router.post('/signin', function(req, res, next) {
  if (req.session.user) res.redirect('/');
  var errors = [];
  Users.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if (user === null) {
      errors.push("Invalid Email / Password");
      res.render('users/signInOrUp', {
        title: "Try Again", 
        postPath: "signin", 
        link: true, 
        errors: errors,
        errEmail: req.body.email });
    }
    if (user) {
      bcrypt.compare(req.body.password, user.password, function(err, response) {
        if (response === true) {
          req.session.user = user;
          res.redirect('/');
        }
        else {
          errors.push("Invalid Email / Password");
          res.render('users/signInOrUp', {
            title: "Try Again", 
            postPath: "signin", 
            link: true, 
            errors: errors,
            errEmail: req.body.email });
        }
      }) 
    }
  })
});

router.get('/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/');
});

module.exports = router;
