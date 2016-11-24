'use strict';
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();
/**
* Demonstrates a simple HTTP endpoint using API Gateway. You have full
* access to the request and response payload, including headers and
* status code.
*
* To scan a DynamoDB table, make a GET request with the TableName as a
* query string parameter. To put, update, or delete an item, make a POST,
* PUT, or DELETE request respectively, passing in the payload to the
* DynamoDB API as a JSON body.
*/
module.exports.postComment = (event, context, callback) => {
//    console.log('Received event:', JSON.stringify(event, null, 2));
//    console.log(event.body);
   console.log('event', event);
//    console.log(context);
   const done = (err, res) => callback(null, {
       statusCode: err ? '400' : '200',
       body: err ? err.message : JSON.stringify(res),
       headers: {
           'Content-Type': 'application/json',
       },
   });
   event.body.serverTime = new Date().toJSON();
   dynamo.putItem({TableName: 'Comments', Item: event.body}, done);

   // switch (event.httpMethod) {
   //     case 'DELETE':
   //         dynamo.deleteItem(JSON.parse(event.body), done);
   //         break;
   //     case 'GET':
   //         dynamo.scan({ TableName: 'Comment' }, done);
   //         // dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
   //         break;
   //     case 'POST':
   //         dynamo.putItem(JSON.parse(event.body), done);
   //         break;
   //     case 'PUT':
   //         dynamo.updateItem(JSON.parse(event.body), done);
   //         break;
   //     default:
   //         done(new Error(`Unsupported method "${event.httpMethod}!!!"`));
   // }
};
