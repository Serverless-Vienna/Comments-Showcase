const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const sanitizeHtml = require("sanitize-html");

// for posting via rest, but missing authentication
// errorCode = auth/argument-error, errorMessage = Firebase ID token
// has incorrect "aud" (audience) claim.
// Expected "serverless-vienna" but got "262782035764-nnr8gnetg94km271u00i4j3n674i9djf.apps.googleusercontent.com". Make sure the ID token comes from the same Firebase project as the service account used to authenticate this SDK. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token., email = undefined, credential = undefined
// https://en.wikipedia.org/wiki/Confused_deputy_problem
// problem was, it was the wrong id_token (the one from google authresponse has the wrong aud), but it bust be from firebase, e.g. via signInWithCredential on cient side.
// configure google client id for web application: https://console.cloud.google.com/apis/credentials/oauthclient/262782035764-nnr8gnetg94km271u00i4j3n674i9djf.apps.googleusercontent.com?project=serverless-vienna
// configure firebase authentication for google client id in whitelist https://console.firebase.google.com/project/serverless-vienna/authentication/providers

exports.comments = functions.https.onRequest((req, res) => {
  // http://stackoverflow.com/questions/42140247/access-control-allow-origin-not-working-google-cloud-functions-gcf
  // set JSON content type and CORS headers for the response
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  //respond to CORS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send("").end();
  }

  if (req.method !== "POST") {
    return res.status(501).send("Not Implemented! Only POST and OPTIONS method is implemented!");
  }

  const newComment = JSON.parse(req.body);
  console.log(`got new comment + ${JSON.stringify(newComment)}`);
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  return admin.auth().verifyIdToken(req.query.auth)
    .then((decodedToken) => {
      console.log(`decodedToken = " + ${JSON.stringify(decodedToken)}`);

      newComment.timestamp = new Date().toJSON();
      newComment.value = sanitizeHtml(newComment.value, {
        allowedTags: [ "h1", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
        "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "ins", "pre" ]
      });

      console.log(`writing new comment " + ${JSON.stringify(newComment)}`);

      return admin.database().ref("/comments").push(newComment).then((snapshot) => {
        return res.status(200).end();
      });
    }).catch((error) => {
      console.error(`errorCode = ${error.code}, errorMessage = ${error.message}, email = ${error.email}, credential = ${error.credential}`);
      return res.status(401).send("Not authorized!").end();
    });
});


exports.commentAddedToInbox = functions.database.ref("/inbox-comments/{pushId}").onWrite((event) => {

  const comment = event.data.val();
  console.log(`commentAddedToInbox: got ${JSON.stringify(comment)}`);

  comment.timestamp = new Date().toJSON();
  comment.value = sanitizeHtml(comment.value, {
    allowedTags: [ "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
    "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "ins", "pre" ]
  });

  return admin.database().ref("/comments").push(comment);
});


const pureUppercase = (mixedCase) => {
  return mixedCase.toUpperCase();
};
exports.pureUppercase = pureUppercase;

exports.upperCase = functions.database
  .ref("/comments/{pushId}/value")
  .onWrite((event) => {

    const newValue = pureUppercase(event.data.val());

    return event.data.ref.set(newValue);

  }
);

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.getRandom = getRandom;


exports.addRandom = functions.database.ref("/comments/{pushId}")
  .onWrite((event) => {

    // Only edit data when it is first created.
    // working guard, variant 1:
    if (event.data.previous.exists()) {
      return null;
    }
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return null;
    }

    const inboundComment = event.data;
    console.log("addRandom: got " + JSON.stringify(inboundComment));

    // working guard, variant 2:
    if (inboundComment.val().random !== undefined) {
      console.log("addRandom: unreachable");
      return null;
    }

    // working guard, variant 3:
    if (inboundComment.hasChild("random")) {
      console.log("already has random");
      return null;
    }

    return event.data.ref.child("random").set(getRandom(1, 100));
    // return event.data.ref.parent.child(
    //   event.params.pushId).child("random").set(getRandom(1, 100)
    // );
    // return event.data.ref.update({ "random": getRandom(1, 100) });
  }
);

exports.sanitizeUnthrustedText = functions.database.ref("/comments/{pushId}/userContent")
  .onWrite((event) => {

    const unthrustedText = event.data.val();
    const sanitizedValue = sanitizeHtml(unthrustedText, {
      allowedTags: [ "h1", "h2", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
      "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "ins", "pre" ]
    });
    console.log(`sanitizeUnthrustedText: ${event.params.pushId}, ${unthrustedText} to ${sanitizedValue}`);

    return event.data.ref.set(sanitizedValue);
  }
);
