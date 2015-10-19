var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/test');
var Students = db.get('students');

router.get('/', function(req, res, next) {
  if (!req.session.user) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
      message: err.message,
      error: err
    });
  }
  Students.find({}, function(err, students) {
    res.render('students/index', { title: 'Students', students: students});
  })
});

router.get('/new', function(req, res, next) {
  if (!req.session.user) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
      message: err.message,
      error: err
    });
  }
  res.render('students/new', {title: 'New Student', errors: []});
})

router.post('/new', function(req, res, next) {
  var errors = [];
  Students.findOne({name: req.body.name, number: req.body.number}, function(err, student) {
    if (student) errors.push("That student is already on the list");
    if (!req.body.name) errors.push("Name cannot be blank");
    if (!req.body.number) errors.push("Phone number cannot be blank");
    // add more validation for phone number here
    else if (req.body.number.indexOf("-") === -1) errors.push("Must be a valid phone number");
    if (errors.length) res.render('students/new', {title: "New Student", errors: errors});
    else {
      Students.insert({name: req.body.name, number: req.body.number}, function(err, student) {
        res.redirect('/students');
      })
    }
  })    
})

router.get('/:id', function(req, res, next) {
  if (!req.session.user) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
      message: err.message,
      error: err
    });
  }
  Students.findOne({_id: req.params.id}, function(err, student) {
    res.render('students/show', {student: student});
  })
})

module.exports = router;
