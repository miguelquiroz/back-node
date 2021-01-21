global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
var cognito = {};

const poolData = {    
    UserPoolId : "", // Your user pool id here    
    ClientId : "" // Your client id here
}; 
const pool_region = 'us-east-2';

//Constant to user roles
const adminRole = "admin";
const userRole = "employee";

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


cognito.RegisterUser = function RegisterUser(data){
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value: data.Name}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:last_name",Value: " "}));  
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:user_role",Value: adminRole}));   
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:data.Email}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value: data.Email}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value: data.Phonenumber}));    
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"zoneinfo", Value: "(UTC-06:00) America/Mexico_City"}));
    return new Promise(function(resolve, reject) {
        userPool.signUp(data.Email, data.Password, attributeList, null, function(err, result){
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
    
};

cognito.Login = function Login(data) {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : data.Email,
        Password : data.Password,
    });

    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise(function(resolve, reject) {      
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                console.log('id token + ' + result.getIdToken().getJwtToken());
                console.log('refresh token + ' + result.getRefreshToken().getToken());
                resolve(result);
            },
            onFailure: function(err) {
                reject(err);
            },
        });
    });   
};

cognito.ChangePassword = function(data){
    var userData = {
        Username : data.Email,
        Pool : userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise(function(resolve, reject) {      
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                cognitoUser.changePassword(data.Password, data.Newpassword, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("Successfully changed password of the user.");
                        console.log(result);
                        resolve(result);
                    }
                });
            },
            onFailure: function(err) {
                reject(err);
            },
        });
    });   
};

cognito.ResetPassword = function(data)
{
    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise(function(resolve, reject) {      
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                resolve(result);
            },
            onFailure: function(err) {
                reject(err);
            },
            undefined
        });
    }); 
};

cognito.ConfirmPassword = function(data)
{
    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise(function(resolve, reject) {      
        cognitoUser.confirmPassword(data.VerificationCode, data.Password,{
            onSuccess: function (result) {
                resolve({
                    "Msg" : "Successfully update password of the user"
                });
            },
            onFailure: function(err) {
                reject(err);
            },
            undefined
        });
    }); 
};

cognito.ConfirmRegistration =  function(data){
    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise(function(resolve, reject) {      
        cognitoUser.confirmRegistration(data.VerificationCode, true,function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);      
        });
    }); 
};


//atributes
cognito.GetUserAttributes = function(data)
{
    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise(function(resolve, reject) {   
        cognitoUser.getSession(function(err, session) {
            if (err) {
                reject({"message" : err.message});
            }
            cognitoUser.getUserAttributes(function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });   
        
    }); 
}

cognito.UpdateUserAttributes = function(data)
{
    var userData = {
        Username : data.Email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value: data.Name}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:last_name",Value: data.LastName}));    
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value: data.Phonenumber})); 
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"zoneinfo", Value: data.Timezone}));
    return new Promise(function(resolve, reject) {      
        cognitoUser.getSession(function(err, session) {
            if (err) {
                reject({"message" : err.message});
            }
            cognitoUser.updateAttributes(attributeList,function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);      
            });
        });      
    }); 
}

module.exports = cognito;