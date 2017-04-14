const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/*
// for posting via rest, but missing authentication
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push it into the Realtime Database then send a response
  admin.database().ref('/messages').push({text: original, name: "anonymous"}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase
    // console.
    res.redirect(303, snapshot.ref);
  });
});
*/

exports.addServerTime = functions.database.ref('/inbox-messages/{pushId}').onWrite(event => {
  // Grab the message that was written to the Realtime Database.
  const inboundMessage = event.data;
  // avoiding Error: Firebase.push failed: first argument contains a function in property 'messages.app.firebaseInternals_.firebase_.credential.cert' with contents: function (serviceAccountPathOrObject) {
  // cant push or manipulate inboundMessage directly
  var message = JSON.parse(JSON.stringify(inboundMessage));
  console.log(" got inboundMessage " + JSON.stringify(inboundMessage));

  message.serverTime = new Date().toJSON();

  // You must return a Promise when performing asynchronous tasks inside a
  // Functions such as writing to the Firebase Realtime Database.
  return admin.database().ref('/messages').push(message).then(() => { console.log("http://stackoverflow.com/questions/43151022/firebase-cloud-function-onwrite-timeout") });
});

// exports.addServerTimeDirectly = functions.database.ref('/messages/{pushId}').onWrite(event => {
//   // Grab the current value of what was written to the Realtime Database.
//   const inboundMessage = event.data;
//   console.log(" got inboundMessage " + JSON.stringify(inboundMessage));
//
//   // You must return a Promise when performing asynchronous tasks inside a
//   // Functions such as writing to the Firebase Realtime Database. Setting an
//   // "serverTime" sibling in the Realtime Database returns a Promise. return
//   // return event.data.ref.child('serverTime').set(new Date().toJSON());
//   return event.data.ref.update({"serverTime": new Date().toJSON()});
// });
