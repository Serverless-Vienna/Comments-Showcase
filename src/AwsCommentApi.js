import AWSMqtt from 'aws-mqtt-client';
import APPCONFIG from './config.json';
import AWS from 'aws-sdk';

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
        serverTime: message.serverTime.S,
        value: message.value ?
          message.value.S : '',
        sender: message.sender ?
          message.sender.S : ''
      });
    });
  }

  post(comment) {
    var apigClient = window.apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: APPCONFIG.AWS.REGION
    });
    return apigClient.commentsPost({}, comment);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      window.apigClientFactory.newClient()
        .commentsGet({}, {})
        .then((response) => {
          resolve(JSON.parse(response.data.body).Items);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

}
