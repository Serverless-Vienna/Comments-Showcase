import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import SenderButton from './SenderButton'
import MessageList from './MessageList';
// import CommentForm from './CommentForm'
import AWSMqtt from 'aws-mqtt-client';
import Config from './config.json';






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
      this.setState({messages: [...this.state.messages, JSON.parse(message)] });
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
        this.state.mqttClient.publish(Config.AWS_IOT_TOPIC, JSON.stringify({ key: Date.now(),  value: data}));
    }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to Serverless Vienna</h2>
          <h2>Comments Showcase</h2>
        </div>
        <MessageList list={this.state.messages} />
        {/*<SenderButton publishMessage={this.publishMessage}/>*/}
        {/* <CommentForm publishMessage={this.publishMessage}/> */}

      </div>
    );
  }
}

export default App;
