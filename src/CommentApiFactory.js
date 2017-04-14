import FirebaseCommentApi from './FirebaseCommentApi';

export default class CommentApiFactory {
  static FIREBASE = 'FIREBASE';

  static create(PROVIDER, onMessage) {
    if (PROVIDER === CommentApiFactory.FIREBASE) {
      return new FirebaseCommentApi(onMessage);
    } else {
      throw new Error("Unknown Provider " + PROVIDER);
    }
  }
}
