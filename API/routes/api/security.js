var express = require('express')
,bodyParser = require('body-parser');
var cognito = require('./AWS/cognito.js');
var Joi = require('joi');
var validator = require('express-joi-validation')({});
var router = express.Router();
router.use(require('body-parser').json());


/* GET Api listing. */
router.get('/', function(req, res, next) {
  res.render('api', { message: "Welcome to the API", title: 'Security API' });
});

// SignIn 
const userSchema = Joi.object({
    Name: Joi.string().min(2).max(50).required(),
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    Password: Joi.string().min(4).max(50).required(),
    Phonenumber: Joi.string().min(10).max(15).required(),
});

router.post('/signup', validator.body(userSchema), (req, res, next) => {
    cognito.RegisterUser(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});


//Login
const loginSchema = Joi.object({
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    Password: Joi.string().min(4).max(50).required(),
});

router.post('/signingin', validator.body(loginSchema), (req, res, next) => {
    cognito.Login(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

//Change password
const changePassSchema = Joi.object({
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    Password: Joi.string().min(4).max(50).required(),
    Newpassword: Joi.string().min(4).max(50).required(),
});

router.post('/ChangePassword', validator.body(changePassSchema), (req, res, next) => {
    cognito.ChangePassword(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});


//forgot password
const resetPassSchema = Joi.object({
    Email: Joi.string().email({ minDomainAtoms: 2 }).required()
});

router.post('/ResetPassword', validator.body(resetPassSchema), (req, res, next) => {
    cognito.ResetPassword(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

const confirmPassSchema = Joi.object({
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    Password: Joi.string().min(4).max(50).required(),
    VerificationCode: Joi.string().min(4).max(50).required(),
});
router.post('/ConfirmPassword', validator.body(confirmPassSchema), (req, res, next) => {
    cognito.ConfirmPassword(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

//Confirm registration
const confirmAccountSchema = Joi.object({
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    VerificationCode: Joi.string().min(4).max(50).required(),
});
router.post('/ConfirmRegistration', validator.body(confirmAccountSchema), (req, res, next) => {
    cognito.ConfirmRegistration(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

//Attributes
const userAttributesSchema = Joi.object({
    Name: Joi.string().min(2).max(50).required(),
    LastName : Joi.string().min(2).max(100).required(),
    Email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    Phonenumber: Joi.string().min(10).max(15).required(),
    Timezone: Joi.string().min(10).max(80).required()
});
router.post('/UpdateUserAttributes', validator.body(userAttributesSchema), (req, res, next) => {
    cognito.UpdateUserAttributes(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

router.post('/GetUserAttributes', validator.body(resetPassSchema), (req, res, next) => {
    cognito.GetUserAttributes(req.body)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});
module.exports = router;
