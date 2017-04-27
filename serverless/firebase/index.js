const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const sanitizeHtml = require('sanitize-html');

/*
exports.serverTime = functions.database.ref('/inbox-comments/{pushId}/serverTime').onWrite(event => {

  const serverTimeFromInboxComment = event.data.val();
  console.log(" got serverTimeFromInboxComment " + serverTimeFromInboxComment);

  return;
});
*/


// for posting via rest, but missing authentication
// errorCode = auth/argument-error, errorMessage = Firebase ID token has incorrect "aud" (audience) claim. Expected "serverless-vienna" but got "262782035764-nnr8gnetg94km271u00i4j3n674i9djf.apps.googleusercontent.com". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token., email = undefined, credential = undefined
// https://en.wikipedia.org/wiki/Confused_deputy_problem
// problem was, it was the wrong id_token (the one from google authresponse has the wrong aud), but it bust be from firebase, e.g. via signInWithCredential on cient side.
// configure google client id for web application: https://console.cloud.google.com/apis/credentials/oauthclient/262782035764-nnr8gnetg94km271u00i4j3n674i9djf.apps.googleusercontent.com?project=serverless-vienna
// configure firebase authentication for google client id in whitelist https://console.firebase.google.com/project/serverless-vienna/authentication/providers

exports.comments = functions.https.onRequest((req, res) => {
  // http://stackoverflow.com/questions/42140247/access-control-allow-origin-not-working-google-cloud-functions-gcf
  // set JSON content type and CORS headers for the response
  res.header('Content-Type','application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  //respond to CORS preflight requests
  if (req.method === 'OPTIONS') {
      return res.status(204).send('').end();
  }

  if (req.method !== 'POST') {
    return res.status(501).send('Not Implemented! Only POST method is implemented!');
  }

  var newComment = JSON.parse(req.body);
  console.log(" got new comment " + JSON.stringify(newComment));
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  return admin.auth().verifyIdToken(req.query.auth)
    .then(function(decodedToken) {
      var uid = decodedToken.uid;
      // decodedToken = {"iss":"https://securetoken.google.com/serverless-vienna","name":"László Király","picture":"https://lh3.googleusercontent.com/-NPbwpQhNZEw/AAAAAAAAAAI/AAAAAAAAAAA/AMcAYi-uHXeD11AcuOQul5j87hgBvH2UkQ/s96-c/photo.jpg","aud":"serverless-vienna","auth_time":1492467546,"user_id":"dzG7QjjvCqYMNhmod3kBuu2w3gB2","sub":"dzG7QjjvCqYMNhmod3kBuu2w3gB2","iat":1492467546,"exp":1492471146,"email":"laszlo.t.kiraly@gmail.com","email_verified":true,"firebase":{"identities":{"google.com":["118218554872242180454"],"email":["laszlo.t.kiraly@gmail.com"]},"sign_in_provider":"google.com"},"uid":"dzG7QjjvCqYMNhmod3kBuu2w3gB2"}
      console.log('decodedToken = ' + JSON.stringify(decodedToken));

      newComment.serverTime = new Date().toJSON();
      newComment.value = sanitizeHtml(newComment.value, {
        allowedTags: [ 'h1', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
      });

      console.log(" writing new comment " + JSON.stringify(newComment));

      return admin.database().ref('/comments').push(newComment).then(snapshot => {
        return res.status(200).end();
      });
    }).catch(function(error) {
      console.error(`errorCode = ${error.code}, errorMessage = ${error.message}, email = ${error.email}, credential = ${error.credential}`);
      return res.status(401).send('Not authorized!').end();
    });
});


/*
exports.commentAddedToInbox = functions.database.ref('/inbox-comments/{pushId}').onWrite(event => {

  const inboundComment = event.data.val();
  console.log(" got inboundComment " + JSON.stringify(inboundComment));

  // avoiding Error: Firebase.push failed: first argument contains a function in property 'comments.app.firebaseInternals_.firebase_.credential.cert' with contents: function (serviceAccountPathOrObject) {
  // cant push or manipulate inboundComment directly
  // var comment = JSON.parse(JSON.stringify(inboundComment));

  var comment = inboundComment;
  comment.serverTime = new Date().toJSON();
  comment.value = sanitizeHtml(comment.value, {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
  });

  return admin.database().ref('/comments').push(comment).then(() => { console.log("commentAddedToInbox http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});
*/

/*
exports.upperCase = functions.database
  .ref("/comments/{pushId}/value")
  .onWrite((event) => {

    const newValue = event.data.val().toUpperCase();

    return event.data.ref.set(newValue);

});
*/

/*
exports.commentAdded = functions.database.ref('/comments/{pushId}').onWrite(event => {

  const inboundComment = event.data;

  if (inboundComment.hasChild("serverTime")) {
    console.log("already has serverTime");
    return;
  }

  return event.data.ref.update({
    "serverTime": new Date().toJSON()
  }).then(() => { console.log("commentAdded http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});
*/

/*
exports.commentAdded = functions.database.ref('/comments/{pushId}').onWrite(event => {

  const inboundComment = event.data;
  console.log(" got inboundComment " + JSON.stringify(inboundComment));

  // go go recursion:
  //
  //if (inboundComment.serverTime !== undefined) {
  //  console.log(" inboundComment.serverTime was" + inboundComment.serverTime);
  //  return;
  //}
  //
  if (inboundComment.hasChild("serverTime")) {
    console.log("already has serverTime");
    return;
  }

  // return event.data.ref.child('serverTime').set(new Date().toJSON())
  return event.data.ref.update({
    "serverTime": new Date().toJSON()
  }).then(() => { console.log("commentAdded http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});

exports.sanitize = functions.database.ref('/comments/{pushId}/value').onWrite(event => {

  const original = event.data.val();
  var sanitizedValue = sanitizeHtml(original, {
    allowedTags: [ 'h1', 'h2', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
  });
  console.log('Sanitizing ', event.params.pushId, original + '\nto\n' + sanitizedValue);

  // You must return a Promise when performing asynchronous tasks inside a
  // Functions such as writing to the Firebase Realtime Database. Setting an
  // "uppercase" sibling in the Realtime Database returns a Promise. return
  // event.data.ref.parent.child('uppercase').set(uppercase);
  return event.data.ref.set(sanitizedValue).then(() => { console.log("sanitize http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});
*/
