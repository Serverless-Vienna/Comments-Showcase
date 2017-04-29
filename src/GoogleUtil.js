import * as firebase from "firebase";

export default class GoogleUtil {

  static signout() {
    return window.gapi.auth2.getAuthInstance().signOut().then(() => {
      if (firebase.apps.length) {
        firebase.auth().signOut();
      }
    });
  }

  static handleResponse(authResult) {
    if (authResult && authResult.error) {
      console.error(`there was a problem with authentication: ${JSON.stringify(authResult)}`)
      return false;
    }
    if (!authResult.isSignedIn()) {
      return false;
    }
    if (!firebase.apps.length) {
      return {
        email: authResult.getBasicProfile().getEmail(),
        id_token: authResult.getAuthResponse().id_token
      };
    }
    // taken from https://firebase.google.com/docs/auth/web/google-signin
    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!GoogleUtil.isUserEqual(authResult, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        const credential = firebase.auth.GoogleAuthProvider.credential(authResult.getAuthResponse().id_token);
        // Sign in with credential from the Google user.
        firebase.auth().signInWithCredential(credential).catch((error) => {
          console.error(`errorCode = ${error.code}, errorMessage = ${error.message}, email = ${error.email}, credential = ${error.credential}`);
        });
      } else {
        console.log('User already signed-in Firebase.');
      }
    });
    return {
      email: authResult.getBasicProfile().getEmail(),
      id_token: authResult.getAuthResponse().id_token
    };
  }

  static isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;
      for (let i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  }

}
