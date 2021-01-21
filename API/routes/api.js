var express = require('express');
var router = express.Router();

/* GET Api listing. */
router.get('/', function(req, res, next) {
  res.render('api', { message: "Welcome to the API", title: 'General API' });
});

module.exports = router;
