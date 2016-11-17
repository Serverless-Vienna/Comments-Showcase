import AwsCommentApi from './AwsCommentApi';

export default class CommentApiFactory {
  static AWS = 'AWS';

  static create(PROVIDER, onMessage) {
    if (PROVIDER === CommentApiFactory.AWS) {
      return new AwsCommentApi(onMessage);
    } else {
      throw new Error("Unknown Provider " + PROVIDER);
    }
  }
}
