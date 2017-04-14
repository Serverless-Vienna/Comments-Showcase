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
    this.messagesRef = this.database.ref('messages');
    this.messagesRef.on('child_added', this.unwrapMessage(onMessage));
    // this.messagesRef.on('child_changed', this.unwrapMessage(onMessage));
  }

  unwrapMessage(onMessage) {
    return function(message) {
      return onMessage(message.val());
    }
  }

  post(comment) {
    return this.messagesRef.push(comment);
  }

  getAll() {
    // already contained in messagesRef
    return new Promise((resolve) => {
      resolve([]);
    })
  }

}
