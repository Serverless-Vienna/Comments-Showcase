import AwsCommentApi from "./AwsCommentApi";
import FirebaseCommentApi from "./FirebaseCommentApi";

export default class CommentApiFactory {
  static AWS = "AWS";
  static FIREBASE = "FIREBASE";

  static create(PROVIDER, onMessage) {
    if (PROVIDER === CommentApiFactory.AWS) {
      return new AwsCommentApi(onMessage);
    } else if (PROVIDER === CommentApiFactory.FIREBASE) {
      return new FirebaseCommentApi(onMessage);
    } else {
      throw new Error(`Unknown Provider ${PROVIDER}`);
    }
  }
}
