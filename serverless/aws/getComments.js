'use strict';

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

/**
* Demonstrates a simple HTTP endpoint using API Gateway.
*
* To scan a DynamoDB table, make a GET request with the TableName as a
* query string parameter.
*/
module.exports.getComments = (event, context, callback) => {
   console.log('event', event);
   const response = (err, res) => callback(null, {
       statusCode: err ? '400' : '200',
       body: err ? err.message : JSON.stringify(res),
       headers: {
        'Content-Type': 'application/json'
        // 'Access-Control-Allow-Origin': '*'  // CORS for lambda-proxy   W T F
       },
   });
   dynamo.scan({ TableName: 'Comments' }, response);
};
