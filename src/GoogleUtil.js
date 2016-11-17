
export default class GoogleUtil {

  static signout() {
    return window.gapi.auth2.getAuthInstance().signOut();
  }

  static handleResponse(authResult) {
    if (authResult && authResult.isSignedIn()) {
      return {
        email: authResult.getBasicProfile().getEmail(),
        id_token: authResult.getAuthResponse().id_token
      };
    } else {
      return false;
    }
  }
}
