var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/test');
var Students = db.get('students');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Students' });
});

module.exports = router;
