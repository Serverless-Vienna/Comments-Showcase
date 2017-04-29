import AWSMqtt from 'aws-mqtt-client';
import APPCONFIG from './config.json';
import AWS from 'aws-sdk';
import apigClientFactory from 'aws-api-gateway-client';

export default class AwsCommentApi {

  constructor(onMessage) {
    this.mqttClient = new AWSMqtt({
      accessKeyId: APPCONFIG.AWS.IOT.USER.ACCESS_KEY,
      secretAccessKey: APPCONFIG.AWS.IOT.USER.SECRET_KEY,
      endpointAddress: APPCONFIG.AWS.IOT.ENDPOINT,
      region: APPCONFIG.AWS.REGION
    });

    this.mqttClient.on('connect', () => {
      this.mqttClient.subscribe(APPCONFIG.AWS.IOT.TOPIC);
    });

    this.mqttClient.on('message', (topic, message) => {
      message = JSON.parse(message);
      onMessage({
        uuid: message.uuid.S,
        timestamp: message.serverTime.S,
        value: message.value ?
          message.value.S : '',
        sender: message.sender ?
          message.sender.S : ''
      });
    });
  }

  fixTimestamp(comments) {
    comments.forEach((item) => {
      item.timestamp = item.serverTime;
      delete item.serverTime;
    });
    return comments;
  }

  post(comment) {
    var apigClient = apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: APPCONFIG.AWS.REGION,
        invokeUrl: APPCONFIG.AWS.FUNCTIONS.INVOKE_URL
    });
    return apigClient.invokeApi({}, '/comments', 'POST', {}, comment);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      apigClientFactory.newClient({ invokeUrl: APPCONFIG.AWS.FUNCTIONS.INVOKE_URL })
        // .commentsGet({}, {})
        .invokeApi({}, '/comments', 'GET', {}, {})
        .then((response) => {
          resolve(this.fixTimestamp(JSON.parse(response.data.body).Items));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

}
