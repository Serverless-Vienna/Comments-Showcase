const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const sanitizeHtml = require('sanitize-html');

/*
exports.serverTime = functions.database.ref('/inbox-messages/{pushId}/serverTime').onWrite(event => {

  const serverTimeFromInboxMessage = event.data.val();
  console.log(" got serverTimeFromInboxMessage " + serverTimeFromInboxMessage);

  return;
});
*/

/*
// for posting via rest, but missing authentication
// errorCode = auth/argument-error, errorMessage = Firebase ID token has incorrect "aud" (audience) claim. Expected "serverless-vienna" but got "262782035764-nnr8gnetg94km271u00i4j3n674i9djf.apps.googleusercontent.com". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token., email = undefined, credential = undefined
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addTest = functions.https.onRequest((req, res) => {
  const original = req.body.text;
  console.log("received auth: " + req.query.auth);
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  return admin.auth().verifyIdToken(req.query.auth)
    .then(function(decodedToken) {
      var uid = decodedToken.uid;
      // ...
      return admin.database().ref('/testMessages').push({text: original, name: "anonymous"}).then(snapshot => {
        res.status(200).end();
      });
    }).catch(function(error) {
      console.error(`errorCode = ${error.code}, errorMessage = ${error.message}, email = ${error.email}, credential = ${error.credential}`);
      res.status(401).send('Not authorized!');
    });
  // // Grab the text parameter.
  // const original = req.body.text;
  // // Push it into the Realtime Database then send a response
  // admin.database().ref('/testMessages').push({text: original, name: "anonymous"}).then(snapshot => {
  //   // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase
  //   // console.
  //   res.redirect(303, snapshot.ref);
  // });
});
*/


exports.messageAddedToInbox = functions.database.ref('/inbox-messages/{pushId}').onWrite(event => {

  const inboundMessage = event.data.val();
  console.log(" got inboundMessage " + JSON.stringify(inboundMessage));

  // avoiding Error: Firebase.push failed: first argument contains a function in property 'messages.app.firebaseInternals_.firebase_.credential.cert' with contents: function (serviceAccountPathOrObject) {
  // cant push or manipulate inboundMessage directly
  // var message = JSON.parse(JSON.stringify(inboundMessage));

  var message = inboundMessage;
  message.serverTime = new Date().toJSON();
  message.value = sanitizeHtml(message.value, {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
  });

  return admin.database().ref('/messages').push(message).then(() => { console.log("messageAddedToInbox http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});

/*
exports.messageAdded = functions.database.ref('/messages/{pushId}').onWrite(event => {

  const inboundMessage = event.data;
  console.log(" got inboundMessage " + JSON.stringify(inboundMessage));

  // go go recursion:
  //
  //if (inboundMessage.serverTime !== undefined) {
  //  console.log(" inboundMessage.serverTime was" + inboundMessage.serverTime);
  //  return;
  //}
  //
  if (inboundMessage.hasChild("serverTime")) {
    console.log("already has serverTime");
    return;
  }

  // return event.data.ref.child('serverTime').set(new Date().toJSON())
  return event.data.ref.update({
    "serverTime": new Date().toJSON()
  }).then(() => { console.log("messageAdded http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});

exports.sanitize = functions.database.ref('/messages/{pushId}/value').onWrite(event => {

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
