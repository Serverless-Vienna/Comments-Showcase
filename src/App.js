import React, { Component } from 'react';
import AWS from 'aws-sdk';
import './App.css';
import AwsUtil from './AwsUtil';
import APPCONFIG from './config.json';
import GoogleLogin from 'react-google-login';
import RichEditorExample from './RichEditorExample';
import './RichEditor.css';
import MessageList from './MessageList';
import CommentApiFactory from './CommentApiFactory';

class App extends Component {
  constructor(props) {
    super(props);
    this.publishMessage = this.publishMessage.bind(this);
    this.resetState = this.resetState.bind(this);
    this.fetchCommentList = this.fetchCommentList.bind(this);
    this.handleResponseGoogle = this.handleResponseGoogle.bind(this);
    this.signoutFromGoogle = this.signoutFromGoogle.bind(this);
    this.commentApi = CommentApiFactory.create(
      CommentApiFactory.AWS, (message) => {
        this.setState({
          messages: [
            message, ...this.state.messages
          ]
        });
      }
    );
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

          AwsUtil.bindOpenId(authResult.getAuthResponse().id_token).then((result) => {
            this.setState(...result, {loggedIn: true});
          }).catch(error => {
            console.dir(error);
            window.alert('Something went wrong while binding open id to aws credentials!');
          });

      } else {
          this.resetState();
          window.alert('Login was not successful');
      }
  }

  fetchCommentList() {
    this.commentApi.getAll().then((messages) => {
      var allMessages = this.state.messages.concat(messages);
      // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
      allMessages.sort(function(a, b) {
          return (a.serverTime < b.serverTime)
              ? 1
              : ((b.serverTime < a.serverTime)
                  ? -1
                  : 0);
      });
      this.setState({messages: allMessages});
    }).catch((error) => {
        if (error.status === 403) {
            window.alert('Please login first')
        }
        console.dir(error);
    });
  }

  publishMessage(comment, postCommentDone) {
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
          postCommentDone(true);
      }).then(() => {
      }).catch((error) => {
          if (error.status === 403) {
              window.alert('Please login first')
          }
          window.alert("Send failed. Please try again later.");
          console.dir(error);
          postCommentDone(false);
      });
  }

  componentWillMount() {
    this.resetState();
    this.fetchCommentList();
    this.setState({ messages: [] });
  }

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
