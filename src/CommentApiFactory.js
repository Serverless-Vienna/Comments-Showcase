import BluemixCommentApi from './BluemixCommentApi';

export default class CommentApiFactory {
  static BLUEMIX = 'BLUEMIX';

  static create(PROVIDER, onMessage) {
    if (PROVIDER === CommentApiFactory.BLUEMIX) {
      return new BluemixCommentApi(onMessage);
    } else {
      throw new Error("Unknown Provider " + PROVIDER);
    }
  }
}
