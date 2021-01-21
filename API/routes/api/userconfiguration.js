var express = require('express')
,bodyParser = require('body-parser');
var dynamo = require('./AWS/dynamo.js');
var Joi = require('joi');
var validator = require('express-joi-validation')({});
var CognitoExpress = require("cognito-express");
var router = express.Router();
router.use(require('body-parser').json());

/* GET Api listing. */
router.get('/', function(req, res, next) {
    res.render('api', { message: "Welcome to the API", title: 'User Configuration API' });
});


//Check if congnito token valid
const cognitoExpress = new CognitoExpress({
    region: "us-east-2",
    cognitoUserPoolId: "",
    tokenUse: "access", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

router.use(function(req, res, next) {
    
    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;
 
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");
 
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {
        
        //If API is not authenticated, Return 401 with error message. 
        if (err) return res.status(401).send(err);
        
        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    });
});


const configurationSchema = Joi.object({
    userID: Joi.string().guid().required(),
    currency: Joi.string().min(2).max(3).required(),
    timeZone: Joi.string().min(2).max(3).required(),
}).unknown();

router.post('/Save', validator.body(configurationSchema), (req, res, next) => {
    dynamo.Upsert(req.body, req.body.userID, "userConfiguration")
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

const configurationGetSchema = Joi.object({
    userID: Joi.string().guid().required(),
})
router.post('/Get',validator.body(configurationGetSchema), (req, res, next) => {
    var getparams =  {
        "userID" : req.body.userID
    }
    dynamo.Get(getparams, "userConfiguration")
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

module.exports = router;