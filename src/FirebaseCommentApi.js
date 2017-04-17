import APPCONFIG from './config.json';
import * as firebase from 'firebase';

export default class FirebaseCommentApi {

  constructor(onMessage) {
    // Initialize Firebase
    var config = {
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

    // Reference to the /messages/ database path.
    // this.inboxMessagesRef = this.database.ref('inbox-messages');
    this.messagesRef = this.database.ref('messages');
    this.messagesRef.on('child_added', this.unwrapMessage(onMessage));
    this.messagesRef.on('child_changed', this.unwrapMessage(onMessage));
  }

  unwrapMessage(onMessage) {
    return function(message) {
      return onMessage(message.val());
    }
  }

  post(comment) {
    // var accessToken = window.credential.idToken;

    return firebase.auth().currentUser.getToken().then(token => {
      // GET https://serverless-vienna.firebaseio.com/messages.json works, because no auth needed

      // var request = new Request('https://serverless-vienna.firebaseio.com/messages.json?access_token='+token, {
      // var request = new Request('https://serverless-vienna.firebaseio.com/inbox-messages.json?auth='+token, {
      var request = new Request('https://us-central1-serverless-vienna.cloudfunctions.net/messages?auth='+token, {
        method: 'POST',
        body: JSON.stringify(comment),
        mode: 'cors',
        redirect: 'follow'
        // did not work
        // headers: new Headers({
        //   'Content-Type': 'application/json',
        //   'Authorization': 'Bearer ' + token
        // })
      });

      return fetch(request);
    });

    // return this.inboxMessagesRef.push(comment);
  }

  getAll() {
    // already contained in messagesRef
    return new Promise((resolve) => {
      resolve([]);
    })
  }

}
