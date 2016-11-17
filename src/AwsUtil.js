import AWS from 'aws-sdk';
import APPCONFIG from './config.json';

export default class AwsUtil {

  // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  static guid = () => {
    var s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  static resetAWSLogin() {
    // http://stackoverflow.com/questions/29524973/how-to-logout-from-amazon-cognito-javascript-and-clear-cached-identityid
    // also used for default unauthenticated "login"
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: APPCONFIG.AWS.COGNITO.IDENTITY_POOL_ID
    });
    // Initialize the Amazon Cognito credentials provider
    AWS.config.update({
      region: APPCONFIG.AWS.REGION
    });
  }

  static bindOpenId(id_token) {
    // web identity for api gateway
    AWS.config.credentials = new AWS.WebIdentityCredentials({
      RoleArn: APPCONFIG.AWS.GOOGLE.ROLE_ARN,
      ProviderId: null, // this is null for Google, else 'graph.facebook.com|www.amazon.com'
      WebIdentityToken: id_token
    });

    var promise = new Promise((resolve, reject) => {
      AWS.config.credentials.get((error) => {
        if (!error) {
          var identityId = AWS.config.credentials.identityId;
          // https://github.com/rpgreen/serverless-todo/blob/master/app/index.html
          var accessKeyId = AWS.config.credentials.accessKeyId;
          var secretAccessKey = AWS.config.credentials.secretAccessKey;
          var sessionToken = AWS.config.credentials.sessionToken;
          resolve({
            awsIdentityId: identityId,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            sessionToken: sessionToken
          });
        } else {
          console.error(error);
          reject(error);
        }
      });
    });
    return promise;
  }
}
