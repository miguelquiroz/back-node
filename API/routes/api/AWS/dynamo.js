var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: "http://dynamodb.us-east-2.amazonaws.com",
  accessKeyId :"",
  secretAccessKey: ""
});

var dynamoOperations = {};

var docClient = new AWS.DynamoDB.DocumentClient();

dynamoOperations.Upsert = function(data, userID,table){
    var getparams = {
        TableName:table,
        Key: {
            "userID" : userID
        }
    };
    var createParams = {
        TableName:table,
        Item: data
    };
    return new Promise(function(resolve, reject) {
        docClient.get(getparams, function(err, dbData) {
            if (err) {
                reject(err);
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                if(Object.keys(dbData).length === 0)
                {
                    docClient.put(createParams, function(err, data) {
                        if (err) {
                            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                            reject(err);
                        } else {
                            console.log("Added item:", JSON.stringify(createParams, null, 2));
                            resolve({
                                "Msg":"Successfully saved!!"
                            });
                        }
                    }); 
                }
                else{
                    var paramsDelete = {
                        TableName: table,
                        Key: {
                            "userID": userID
                        }
                    };
                    docClient.delete(paramsDelete, function(err, data) {
                        if (err) {
                            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                            reject(err);
                        } else {
                            console.log("DeleteItem succeeded:", JSON.stringify(paramsDelete, null, 2));
                            docClient.put(createParams, function(err, data) {
                                if (err) {
                                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                                    reject(err);
                                } else {
                                    console.log("Added item:", JSON.stringify(createParams, null, 2));
                                    resolve({
                                        "Msg":"Successfully saved!!"
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });
};

dynamoOperations.Create = function(data, table){
    var params = {
        TableName:table,
        Item: data
    };
    return new Promise(function(resolve, reject) {
        docClient.put(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                resolve(result);
            }
        });
    });
};

dynamoOperations.Get = function(key, table){
    var params = {
        TableName:table,
        Key: key
    };
    return new Promise(function(resolve, reject) {
        docClient.get(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
};

dynamoOperations.Update = function(key, updateExpresion, conditionExpresion, expresionAttributesValues, table){
    var params = {
        TableName:table,
        Key: key,
        UpdateExpression: updateExpresion,
        ConditionExpression: conditionExpresion,
        ExpressionAttributeValues: expresionAttributesValues,
        ReturnValues:"UPDATED_NEW"
    };
    return new Promise(function(resolve, reject) {
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(result);
            }
        });
    });
};

dynamoOperations.Delete = function(key, updateExpresion, conditionExpresion, expresionAttributesValues, table){
    var params = {
        TableName:table,
        Key:key,
    };
    return new Promise(function(resolve, reject) {
        docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve(result);
            }
        });
    });
};

module.exports = dynamoOperations;
