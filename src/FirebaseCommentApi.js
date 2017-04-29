import APPCONFIG from "./config.json";
import * as firebase from "firebase";

export default class FirebaseCommentApi {

  constructor(onMessage) {
    // Initialize Firebase
    const config = {
      apiKey: APPCONFIG.FIREBASE.apiKey,
      authDomain: APPCONFIG.FIREBASE.authDomain,
      databaseURL: APPCONFIG.FIREBASE.databaseURL,
      projectId: APPCONFIG.FIREBASE.projectId,
      storageBucket: APPCONFIG.FIREBASE.storageBucket,
      messagingSenderId: APPCONFIG.FIREBASE.messagingSenderId
    };
    firebase.initializeApp(config);

    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();

    // this.inboxCommentsRef = this.database.ref("inbox-comments");

    // Reference to the /comments/ database path.
    this.commentsRef = this.database.ref("comments");
    this.commentsRef.on("child_added", this.unwrapMessage(onMessage));
    this.commentsRef.on("child_changed", this.unwrapMessage(onMessage));
  }

  unwrapMessage(onMessage) {
    return (message) => {
      return onMessage(message.val());
    };
  }

  post(comment) {

    return firebase.auth().currentUser.getToken().then((token) => {
      // GET https://serverless-vienna.firebaseio.com/comments.json works, because no auth needed

      // did not work:
      // var request = new Request("https://serverless-vienna.firebaseio.com/comments.json?access_token="+token, {

      // big help: http://stackoverflow.com/questions/22188305/firebase-server-side-auth-with-http-post-request-using-the-firebase-secret
      // var request = new Request("https://serverless-vienna.firebaseio.com/inbox-comments.json?auth="+token, {
      const request = new Request(`https://us-central1-serverless-vienna.cloudfunctions.net/comments?auth=${token}`, {
        method: "POST",
        body: JSON.stringify(comment),
        mode: "cors",
        redirect: "follow"
        // did not work
        // headers: new Headers({
        //   "Content-Type": "application/json",
        //   "Authorization": "Bearer " + token
        // })
      });

      return fetch(request);
    });

    // return this.commentsRef.push(comment);
    // return this.database.ref("inbox-comments").push(comment);
  }

  getAll() {
    // already contained in commentsRef
    return new Promise((resolve) => {
      resolve([]);
    });
  }

}
