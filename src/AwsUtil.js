import AWS from 'aws-sdk';
import APPCONFIG from './config.json';

export default class AwsUtil {

  static resetAWSLogin() {
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
