import React, { Component } from 'react';
import './App.css';
import AWS from 'aws-sdk';
import AWSMqtt from 'aws-mqtt-client'
import AwsUtil from './AwsUtil';
import APPCONFIG from './config.json';
import GoogleLogin from 'react-google-login';
import RichEditorExample from './RichEditorExample';
import './RichEditor.css';
import MessageList from './MessageList';



class App extends Component {
  constructor(props) {
    super(props);
    this.publishMessage = this.publishMessage.bind(this);
    // this.publishMessageToMqtt = this.publishMessageToMqtt.bind(this);
    this.resetState = this.resetState.bind(this);
    this.fetchCommentList = this.fetchCommentList.bind(this);
    this.handleResponseGoogle = this.handleResponseGoogle.bind(this);
    this.signoutFromGoogle = this.signoutFromGoogle.bind(this);
  }

  initMQTT() {
    const mqttClient = new AWSMqtt({
      accessKeyId: APPCONFIG.AWS.IOT.USER.ACCESS_KEY,
      secretAccessKey: APPCONFIG.AWS.IOT.USER.SECRET_KEY,
      endpointAddress: APPCONFIG.AWS.IOT.ENDPOINT,
      region: APPCONFIG.AWS.REGION
    });

    mqttClient.on('connect', () => {
      mqttClient.subscribe(APPCONFIG.AWS.IOT.TOPIC);
      console.log('connected to iot mqtt websocket');
    });

    mqttClient.on('message', (topic, message) => {
      message = JSON.parse(message);
      console.log('message retrieved: ', message);
      this.setState({ messages: [ {uuid: message.uuid.S, serverTime: message.serverTime.S, value: message.value? message.value.S : '', sender: message.sender? message.sender.S : ''}, ...this.state.messages] });
    });

    return mqttClient;
  }

  signoutFromGoogle() {
      var auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signOut().then(() => {
          this.setState({loggedIn: false, email: '', accessToken: ''});
      });
      this.resetState();
  }

  handleResponseGoogle(authResult) {
      if (authResult && authResult.isSignedIn()) {
          this.setState({email: authResult.getBasicProfile().getEmail(), accessToken: authResult.getAuthResponse().access_token});

          // web identity for api gateway
          AWS.config.credentials = new AWS.WebIdentityCredentials({
              RoleArn: 'arn:aws:iam::334066760643:role/googleIdentity', ProviderId: null, // this is null for Google, else 'graph.facebook.com|www.amazon.com'
              WebIdentityToken: authResult.getAuthResponse().id_token
          });

          AwsUtil.obtainAWSCredentials().then((result) => {
              this.setState(...result, {loggedIn: true});
          }).catch((error) => {
              window.alert('Something went wrong while obtaining AWS Credentials!');
          });

      } else {
          this.resetState();
          window.alert('Login was not successful');
      }
  }

  fetchCommentList() {
    var apigClient = window.apigClientFactory.newClient();
    apigClient.commentsGet({}, {}).then((response) => {
        console.dir(response);
        var messages = JSON.parse(response.data.body).Items;
        // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
        messages.sort(function(a, b) {
            return (a.serverTime < b.serverTime)
                ? 1
                : ((b.serverTime < a.serverTime)
                    ? -1
                    : 0);
        });
        this.setState({messages: [...this.state.messages, ...messages]});
    }).then(() => {}).catch((error) => {
        if (error.status === 403) {
            window.alert('Please login first')
        }
        console.dir(error);
    });
  }

  publishMessage(comment, performAction) {
      var apigClient = window.apigClientFactory.newClient({
          accessKey: AWS.config.credentials.accessKeyId,
          secretKey: AWS.config.credentials.secretAccessKey,
          sessionToken: AWS.config.credentials.sessionToken
      });
      apigClient.commentsPost({}, {
          uuid: AwsUtil.guid(),
          clientTime: new Date().toJSON(),
          sender: this.state.email,
          value: comment
      }).then((response) => {
          console.dir(response);
          performAction();
      }).then(() => {
          performAction();
      }).catch((error) => {
          if (error.status === 403) {
              window.alert('Please login first')
          }
          console.log("Error!");
          window.alert("Send failed. Please try again later.");
          console.dir(error);
          performAction();
      });
  }

  componentWillMount() {
    this.fetchCommentList();
    this.resetState();
    let messages = [];
    const mqttClient = this.initMQTT();
    this.setState({ mqttClient: mqttClient, messages: messages });
  }

  // publishMessageToMqtt(data) {
  //   this.state.mqttClient.publish(APPCONFIG.AWS.IOT.TOPIC, JSON.stringify({ uuid: AwsUtil.guid(), clientTime: new Date().toJSON(), value: data }));
  // }

  resetState() {
      this.setState({
          loggedIn: false,
          email: '',
          accessToken: '',
          echo: '',
          serverTime: '',
          awsIdentityId: '',
          accessKeyId: '',
          secretAccessKey: '',
          sessionToken:  ''
      });
      AwsUtil.resetAWSLogin();
  }

  render() {
    return (
      <div className="App">

        <div className="App-header">
          <h2>Welcome to Serverless Vienna</h2>
          <h2>Comments Showcase</h2>
        </div>

        {
            !this.state.loggedIn
            ? <div style={{float: 'right'}}><GoogleLogin className="button login-button" clientId={APPCONFIG.OAUTH.GOOGLE.APP_KEY} buttonText="Login" onSuccess={this.handleResponseGoogle} onFailure={this.handleResponseGoogle} scope="email">
                <span>Login with Google</span>
            </GoogleLogin></div>
            : <div style={{float: 'right'}}><button className="button logout-button" onClick={this.signoutFromGoogle}>
                <span>Logout '{this.state.email}'</span>
            </button></div>
        }
        {
            this.state.loggedIn
                ? <div style={{clear: 'both'}}>
                    <RichEditorExample publishMessage={this.publishMessage}/>
                </div>
                : ''
        }
        <MessageList list={this.state.messages} />
      </div>
    );
  }
}

export default App;
