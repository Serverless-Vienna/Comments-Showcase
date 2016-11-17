import AWSMqtt from 'aws-mqtt-client';
import APPCONFIG from './config.json';

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

  post() {

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
