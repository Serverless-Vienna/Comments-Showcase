import APPCONFIG from './config.json';

export default class BluemixCommentApi {

  constructor(onMessage) {
    // https://8v4fof.internetofthings.ibmcloud.com/dashboard/
    this.orgId = "8v4fof";
    this.clientId = "a:8v4fof:"+this.getRandomInt(1,1000000);
    this.userName = "a-8v4fof-rogsa8wup6";
    this.password = "qBz0jAddVK?1Q3utWX";
    this.subscribeTopic = "iot-2/type/iotphone/id/+/evt/sensorData/fmt/json";
    this.publishTopic = "iot-2/type/iotphone/id/publish/evt/sensorData/fmt/json";

    this.client = new window.Paho.MQTT.Client(this.orgId+".messaging.internetofthings.ibmcloud.com", 8883, this.clientId);

		this.client.onMessageArrived = function(message) {
      console.dir(message);
		  console.log("onMessageArrived:"+message.payloadString);
      onMessage(JSON.parse( message.payloadString ).a);
		};

    this.client.connect({
      onSuccess: () => {
        console.log("subscribing")
        this.client.subscribe(this.subscribeTopic, {
          onSuccess: function(m) {
            console.dir(m);
          },
          onFailure: function(e) {
            console.dir(e);
          }
        });
      },
      onFailure: (e) => {
        console.error(e);
      },
      userName: this.userName,
      password: this.password,
      useSSL: true,
      mqttVersion: 3
    });
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  post(comment) {
    var payload = {
      "a": { ...comment }
    }
    console.dir(payload);
    var message = new window.Paho.MQTT.Message(JSON.stringify(payload));
    message.destinationName = this.publishTopic;
    this.client.send(message);
    return new Promise((resolve, reject) => {
      // try catch <> resolve reject
      resolve();
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }



}
