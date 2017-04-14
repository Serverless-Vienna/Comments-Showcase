import React, {Component} from 'react';
import './App.css';
import GoogleUtil from './GoogleUtil';
import guid from './helper';
import APPCONFIG from './config.json';
import GoogleLogin from 'react-google-login';
import RichEditorExample from './RichEditorExample';
import MessageList from './MessageList';
import CommentApiFactory from './CommentApiFactory';

class App extends Component {
  constructor(props) {
    super(props);
    this.postComment = this.postComment.bind(this);
    this.resetState = this.resetState.bind(this);
    this.fetchCommentList = this.fetchCommentList.bind(this);
    this.handleResponseGoogle = this.handleResponseGoogle.bind(this);
    this.handleResponseGoogleFailure = this.handleResponseGoogleFailure.bind(this);
    this.signoutFromGoogle = this.signoutFromGoogle.bind(this);
    this.commentApi = CommentApiFactory.create(CommentApiFactory.FIREBASE, (message) => {
      this.setState({
        messages: [
          message, ...this.state.messages
        ]
      });
    });
  }

  signoutFromGoogle() {
    GoogleUtil.signout().then(() => {
      this.resetState();
    });
  }

  handleResponseGoogleFailure(error) {
    console.dir(error);
  }

  handleResponseGoogle(authResult) {
    var result = GoogleUtil.handleResponse(authResult);
    if (result === undefined || result === false) {
      this.resetState();
      window.alert('Login was not successful');
    } else {
      this.setState({
        ...result, loggedIn: true
      });
      // now what?

      // AwsUtil.bindOpenId(result.id_token).then((result) => {
      //   this.setState(...result, {loggedIn: true});
      // }).catch(error => {
      //   console.dir(error);
      //   window.alert('Something went wrong while binding open id to aws credentials!');
      // });
    }
  }

  fetchCommentList() {
    this.commentApi.getAll().then((messages) => {
      var allMessages = this.state.messages.concat(messages);
      // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-pr
      // operty-value-in-javascript
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
      } else {
        window.alert('Could not get Comments')
      }
      console.dir(error);
    });
  }

  postComment(comment) {
    this.setState({submitEnabled: false});

    this.commentApi.post({uuid: guid(), clientTime: new Date().toJSON(), sender: this.state.email, value: comment}).then((response) => {
      this.setState({submitEnabled: true});
      this.refs.editor.resetContent();
    }).catch((error) => {
      this.setState({submitEnabled: true});
      if (error.status === 403) {
        window.alert('Please login first')
      }
      window.alert("Send failed. Please try again later.");
      console.dir(error);
    });
  }

  componentWillMount() {
    this.resetState();
    this.fetchCommentList();
    this.setState({messages: []});
  }

  resetState() {
    this.setState({
      loggedIn: false,
      email: '',
      echo: '',
      serverTime: '',
      accessKeyId: '',
      secretAccessKey: '',
      sessionToken: '',
      submitEnabled: true
    });
    if (this.refs.editor) {
      this.refs.editor.resetContent();
    }
    // AwsUtil.resetAWSLogin();
  }

  render() {
    return (
      <div className="App">

        <div className="App-header">
          <h2>Welcome to Serverless Vienna</h2>
          <h2>Comments Showcase</h2>
        </div>

        {!this.state.loggedIn
          ? <div style={{
              float: 'right'
            }}>
              <GoogleLogin
                className="button login-button"
                clientId={APPCONFIG.OAUTH.GOOGLE.APP_KEY}
                buttonText="Login"
                onSuccess={this.handleResponseGoogle}
                onFailure={this.handleResponseGoogleFailure}
                offline={false}
                autoLoad={false}
                scope="profile email">
                <span>Login with Google</span>
              </GoogleLogin>
            </div>
          : <div style={{
            float: 'right'
          }}>
            <button className="button logout-button" onClick={this.signoutFromGoogle}>
              <span>Logout '{this.state.email}'</span>
            </button>
          </div>}
        {this.state.loggedIn
          ? <div style={{
              clear: 'both'
            }}>
              <RichEditorExample
                ref='editor'
                submitEnabled={this.state.submitEnabled}
                publishContent={this.postComment}/>
            </div>
          : ''}
        <MessageList list={this.state.messages}/>
      </div>
    );
  }
}

export default App;
