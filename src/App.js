import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import SenderButton from './SenderButton'
import AWSMqtt from 'aws-mqtt-client'

import Config from './config.json';
import RichEditorExample from './RichEditorExample'
import './RichEditor.css';



class App extends Component {
  constructor(props) {
    super(props);
    this.publishMessage = this.publishMessage.bind(this);
  }

  initMQTT() {
    const mqttClient = new AWSMqtt({
      accessKeyId: Config.AWS.IOT.USER.ACCESS_KEY,
      secretAccessKey: Config.AWS.IOT.USER.SECRET_KEY,
      endpointAddress: Config.AWS.IOT.ENDPOINT,
      region: Config.AWS.REGION
    });

    mqttClient.on('connect', () => {
      mqttClient.subscribe(Config.AWS.IOT.TOPIC);
      console.log('connected to iot mqtt websocket');
    });

    mqttClient.on('message', (topic, message) => {
      console.log('message retrieved: ', JSON.parse(message));
      this.setState({ messages: [...this.state.messages, JSON.parse(message)] });
    });


    return mqttClient;
  }


  componentWillMount() {
    let messages = [];
    const mqttClient = this.initMQTT();
    this.setState({ mqttClient: mqttClient, messages: messages });
  }

  publishMessage(data) {
    console.log('Button was clicked!');
    this.state.mqttClient.publish(Config.AWS.IOT.TOPIC, JSON.stringify({ key: new Date().toJSON(), value: data }));
  }


  render() {
    return (
      <div className="App">

        <div className="App-header">
          <h2>Welcome to Serverless Vienna</h2>
          <h2>Comments Showcase</h2>
        </div>
        
        <RichEditorExample publishMessage={this.publishMessage} />
        <MessageList list={this.state.messages} />        
      </div>
    );
  }
}

export default App;
