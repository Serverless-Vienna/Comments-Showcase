import React, { Component } from "react";
import "./App.css";
import GoogleUtil from "./GoogleUtil";
import AwsUtil from "./AwsUtil";
import guid from "./helper";
import APPCONFIG from "./config.json";
import GoogleLogin from "react-google-login";
import RichEditorExample from "./RichEditorExample";
import CommentList from "./CommentList";
import CommentApiFactory from "./CommentApiFactory";
import ConsoleLogger from "./ConsoleLogger";
import ModalAlert from "./ModalAlert";

class App extends Component {
  constructor(props) {
    super(props);
    this.resetState = this.resetState.bind(this);
    this.handleResponseGoogle = this.handleResponseGoogle.bind(this);
    this.handleResponseGoogleFailure = this.handleResponseGoogleFailure.bind(this);
    this.handleSignoutFromGoogle = this.handleSignoutFromGoogle.bind(this);

    this.postCommentToAll = this.postCommentToAll.bind(this);

    this.setupProviders();
  }

  setupProviders() {
    this.providers = [];

    for (const provider of APPCONFIG.PROVIDERS) {
      this.providers[provider] = {};

      this.providers[provider].receiveComment = this.receiveCommentFromProvider(provider);
      this.providers[provider].receiveComment = this.providers[provider].receiveComment.bind(this);

      this.providers[provider].fetchCommentList = this.fetchCommentListFromProvider(provider);
      this.providers[provider].fetchCommentList = this.providers[provider].fetchCommentList.bind(this);

      this.providers[provider].postComment = this.postCommentFromProvider(provider);
      this.providers[provider].postComment = this.providers[provider].postComment.bind(this);

      this.providers[provider].commentApi = CommentApiFactory
        .create(provider, this.providers[provider].receiveComment);
    }
  }

  componentWillMount() {
    this.resetState();
    const commentsMap = [];
    for (const provider of APPCONFIG.PROVIDERS) {
      commentsMap[provider] = [];
      this.providers[provider].fetchCommentList();
    }
    this.setState({ commentsMap });
  }

  receiveCommentFromProvider(provider) {
    return (newComment) => this.receiveComment(newComment, provider);
  }

  receiveComment(newComment, provider) {
    if (provider === undefined) {
      provider = "default";
    }
    ConsoleLogger.log(`comment received from '${provider}': ${JSON.stringify(newComment)}`);

    const commentsMap = { ...this.state.commentsMap };
    const providerComments = [ ...commentsMap[provider] ];

    for (const [index, comment] of providerComments.entries()) {
      if (comment.uuid === newComment.uuid) {
        providerComments[index] = { ...newComment };
        commentsMap[provider] = providerComments;
        this.setState({ commentsMap });
        return;
      }
    }

    commentsMap[provider] = [ newComment, ...commentsMap[provider] ];
    this.setState({ commentsMap });
  }

  fetchCommentListFromProvider(provider) {
    return () => this.fetchCommentList(provider);
  }

  fetchCommentList(provider) {
    if (provider === undefined) {
      provider = "default";
    }
    this.providers[provider].commentApi.getAll().then((comments) => {
      const commentsMap = { ...this.state.commentsMap };
      const sortedComments = [ ...comments, ...commentsMap[provider] ];
      // http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
      sortedComments.sort((a, b) => {
        if (a.timestamp < b.timestamp) {
          return 1;
        } else if (b.timestamp < a.timestamp) {
          return -1;
        } else {
          return 0;
        }
      });
      // http://stackoverflow.com/questions/13833204/how-to-set-a-js-object-property-name-from-a-variable
      commentsMap[provider] = sortedComments;
      this.setState({ commentsMap });
    }).catch((error) => {
      if (error.status === 403) {
        ModalAlert.alert("Please login first");
      } else {
        ModalAlert.alert("Could not get Comments");
      }
      ConsoleLogger.error(`${error}`);
    });
  }

  postCommentToAll(comment) {
    const promises = [];
    for (const provider of APPCONFIG.PROVIDERS) {
      promises.push(this.providers[provider].postComment(comment));
    }
    return Promise.all(promises);
  }

  postCommentFromProvider(provider) {
    return (comment) => this.postComment(comment, provider);
  }

  postComment(comment, provider) {
    if (provider === undefined) {
      provider = "default";
    }

    this.setState({ submitEnabled: false });

    const newComment = {
      uuid: guid(),
      clientTime: new Date().toJSON(),
      sender: this.state.email,
      value: comment
    };

    const commentsMap = { ...this.state.commentsMap };

    commentsMap[provider] = [ newComment, ...commentsMap[provider] ];

    this.setState({
      commentsMap
    });

    this.providers[provider].commentApi.post(newComment).then((response) => {
      ConsoleLogger.log(`Response from post to ${provider}: ${JSON.stringify(response)}`);
      this.setState({ submitEnabled: true });
      this.editorComp.resetContent();
    }).catch((error) => {
      this.setState({ submitEnabled: true });
      if (error.status === 403) {
        ModalAlert.alert("Please login first");
      }
      ModalAlert.alert("Send failed. Please try again later.");
      ConsoleLogger.error(`${error}`);
    });
  }

  handleSignoutFromGoogle() {
    GoogleUtil.signout().then(() => {
      this.resetState();
    });
  }

  handleResponseGoogleFailure(error) {
    ConsoleLogger.error(`${error}`);
  }

  handleResponseGoogle(authResult) {
    const result = GoogleUtil.handleResponse(authResult);
    if (result === undefined || result === false) {
      this.resetState();
      ModalAlert.alert("Login was not successful");
    } else {
      this.setState({
        ...result, loggedIn: true
      });
      AwsUtil.bindOpenId(result.id_token).then((awsResult) => {
        this.setState(...awsResult, { loggedIn: true });
      }).catch((error) => {
        ConsoleLogger.dir(error);
        ModalAlert.alert("Something went wrong while binding open id to aws credentials!");
      });
    }
  }

  resetState() {
    this.setState({
      loggedIn: false,
      email: "",
      echo: "",
      timestamp: "",
      accessKeyId: "",
      secretAccessKey: "",
      sessionToken: "",
      submitEnabled: true
    });
    if (this.editorComp) {
      this.editorComp.resetContent();
    }
  }

  render() {
    return (
      <div className="App">

        <div className="App-logo">
          <img src="./logo_blue_small.png" className="logo" alt="Serverless Vienna Logo" />
        </div>

        <div className="App-header">
          <h2>Comments Showcase ({
            APPCONFIG.PROVIDERS.map((provider, index) => {
              return (<span key={provider} className="provider">
                {index > 0 && " "}
                {provider}</span>);
            })
          })</h2>
        </div>

        <div style={{ float: "right" }}>
          {!this.state.loggedIn
            ? <GoogleLogin
              className="button login-button"
              clientId={APPCONFIG.OAUTH.GOOGLE.APP_KEY}
              buttonText="Login"
              onSuccess={this.handleResponseGoogle}
              onFailure={this.handleResponseGoogleFailure}
              offline={false}
              autoLoad={false}
              scope="email"
              >
              <span>Login with Google</span>
              </GoogleLogin>
            : <button className="button logout-button" onClick={this.handleSignoutFromGoogle}>
                <span>Logout "{this.state.email}"</span>
              </button>
          }
        </div>
        {this.state.loggedIn
          ? <div style={{ clear: "both" }}>
              <RichEditorExample
                ref={(editorComp) => { this.editorComp = editorComp; }}
                submitEnabled={this.state.submitEnabled}
                publishContent={this.postCommentToAll}
              />
            </div>
          : ""}
        <div style={{ clear: "both" }}>
          {
            APPCONFIG.PROVIDERS.map((provider) => {
              const width = `${100.0 / APPCONFIG.PROVIDERS.length}%`;
              const style = {
                float: "left",
                minWidth: "365px",
                width
              };
              return (
                <div style={style} key={provider}>
                  <CommentList list={this.state.commentsMap[provider]} provider={provider}/>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
