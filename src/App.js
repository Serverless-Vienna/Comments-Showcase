import React, {Component} from 'react';
import './App.css';
import GoogleUtil from './GoogleUtil';
import guid from './helper';
import APPCONFIG from './config.json';
import GoogleLogin from 'react-google-login';
import RichEditorExample from './RichEditorExample';
import CommentList from './CommentList';
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

    this.commentApi = CommentApiFactory.create(CommentApiFactory.FIREBASE, (newComment) => {

      console.log("comment received " + JSON.stringify(newComment));

      var comments = this.state.comments;
      for (let [index, comment] of comments.entries()) {
        if (comment.uuid === newComment.uuid) {
          comments[index] = {...newComment};
          this.setState({
            comments: [
              ...comments
            ]
          });
          return;
        }
      }

      this.setState({
        comments: [
          newComment, ...this.state.comments
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
    }
  }

  fetchCommentList() {
    this.commentApi.getAll().then((comments) => {
      var allComments = this.state.comments.concat(comments);
      // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-pr
      // operty-value-in-javascript
      allComments.sort(function(a, b) {
        return (a.serverTime < b.serverTime)
          ? 1
          : ((b.serverTime < a.serverTime)
            ? -1
            : 0);
      });
      this.setState({comments: allComments});
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

    var newComment = {uuid: guid(), clientTime: new Date().toJSON(), sender: this.state.email, value: comment};

    this.setState({
      comments: [
        newComment, ...this.state.comments
      ]
    });

    this.commentApi.post(newComment).then((response) => {
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
    this.setState({comments: []});
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
    // this.signoutFromGoogle();
    // AwsUtil.resetAWSLogin();
  }

  render() {
    return (
      <div className="App">

        <div className="App-header">
          <h2>Welcome to Serverless Vienna</h2>
          <h2>Comments Showcase</h2>
        </div>

        <div style={{ float: 'right' }}>
          {!this.state.loggedIn
            ? <GoogleLogin
                className="button login-button"
                clientId={APPCONFIG.OAUTH.GOOGLE.APP_KEY}
                buttonText="Login"
                onSuccess={this.handleResponseGoogle}
                onFailure={this.handleResponseGoogleFailure}
                offline={false}
                autoLoad={false}
                scope="email">
                <span>Login with Google</span>
              </GoogleLogin>
            : <button className="button logout-button" onClick={this.signoutFromGoogle}>
                <span>Logout '{this.state.email}'</span>
              </button>
          }
        </div>
        {this.state.loggedIn
          ? <div style={{ clear: 'both' }}>
              <RichEditorExample
                ref='editor'
                submitEnabled={this.state.submitEnabled}
                publishContent={this.postComment}/>
            </div>
          : ''}
        <div style={{ clear: 'both' }}>
          <CommentList list={this.state.comments}/>
        </div>
      </div>
    );
  }
}

export default App;
