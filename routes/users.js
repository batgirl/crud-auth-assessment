var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/test');
var Users = db.get('users');
var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.render('users', {user: req.session.user});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', {title: "Sign Up", errors: ""});
});

router.post('/signup', function(req, res, next) {

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      Users.insert({email: req.body.email, password: hash}, function(err, user) {
        req.session.user = user;
        res.redirect('/users');
      })
    })
  })
});

router.get('/signin', function(req, res, next) {
  res.render('signin', {title: "Sign In", errors: ""});
});

router.post('/signin', function(req, res, next) {
  Users.findOne({email: req.body.email}, function(err, user) {
    if (user === null) console.log("FAILED");
    if (user) {
      bcrypt.compare(req.body.password, user.password, function(err, response) {
        if (response === true) {
          req.session.user = user;
          res.redirect('/users');
        }
    }) }
  })
});

router.get('/signout', function(req, res, next) {
  req.session = null;
  res.redirect('/users');
});

module.exports = router;
