import AWS from "aws-sdk";
import APPCONFIG from "./config.json";
import ConsoleLogger from "./ConsoleLogger";

export default class AwsUtil {

  static resetAWSLogin() {
    // Initialize the Amazon Cognito credentials provider
    AWS.config.update({
      region: APPCONFIG.AWS.REGION
    });
  }

  static bindOpenId(idToken) {
    // web identity for api gateway
    AWS.config.credentials = new AWS.WebIdentityCredentials({
      RoleArn: APPCONFIG.AWS.GOOGLE.ROLE_ARN,
      ProviderId: null, // this is null for Google, else "graph.facebook.com|www.amazon.com"
      WebIdentityToken: idToken
    });

    const promise = new Promise((resolve, reject) => {
      AWS.config.credentials.get((error) => {
        if (!error) {
          const awsIdentityId = AWS.config.credentials.identityId;
          // https://github.com/rpgreen/serverless-todo/blob/master/app/index.html
          const accessKeyId = AWS.config.credentials.accessKeyId;
          const secretAccessKey = AWS.config.credentials.secretAccessKey;
          const sessionToken = AWS.config.credentials.sessionToken;
          resolve({
            awsIdentityId,
            accessKeyId,
            secretAccessKey,
            sessionToken
          });
        } else {
          ConsoleLogger.error(error);
          reject(error);
        }
      });
    });
    return promise;
  }
}
