import * as firebase from 'firebase';

export default class GoogleUtil {

  static signout() {
    return firebase.auth().signOut();
  }

  static handleResponse(googleUser) {
    // taken from https://firebase.google.com/docs/auth/web/google-signin

    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is
    // initialized.
    window.accessToken = googleUser.getAuthResponse().access_token;
    var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!GoogleUtil.isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
        window.credential = credential;
        // Sign in with credential from the Google user.
        firebase.auth().signInWithCredential(credential).catch(function(error) {

          console.error(`errorCode = ${error.code}, errorMessage = ${error.message}, email = ${error.email}, credential = ${error.credential}`);

        });
      } else {
        window.credential = firebase.auth.GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
        console.log('User already signed-in Firebase.');
      }
    });
    return {email: googleUser.getBasicProfile().getEmail(), id_token: googleUser.getAuthResponse().id_token};
  }

  static isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  }

}
