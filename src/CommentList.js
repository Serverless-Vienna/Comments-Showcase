import React from "react";
import sanitizeHtml from "sanitize-html";

class CommentList extends React.Component {

  render() {
    if (this.props.list.length === 0) {
      return (
        <div className="CommentList">
          <div className="ProviderTitle provider"><span>{this.props.provider}</span></div>
          <div className="empty"><span>No comments found.</span></div>
        </div>
      );
    } else {
      return (
        <div className="CommentList">
          <div className="ProviderTitle provider"><span>{this.props.provider}</span></div>
          <ul>
            {/* TODO: use key from item, e.g. client uuid ( + userid or server uuid ? ), also needs a mechanism to deal with duplicate clientIds */}
            {this.props.list.map((item, index) => {
              const timestampFormatted = item.timestamp !== undefined ? new Date(item.timestamp).toLocaleString() : "No timestamp yet";
              const sanitizedContent = sanitizeHtml(item.value, {
                allowedTags: [ "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
                "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "ins", "pre" ]
              });
              return (<li key={item.uuid}>
                <span className="key">from <b>{item.sender}</b> (@{timestampFormatted}):</span><br/>
                <span className="value" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                {this.props.list.length > 1 && this.props.list.length - 1 !== index && <hr className="comment-hr"/>}
              </li>);
            })}
          </ul>
        </div>
      );
    }
  }
}

export default CommentList;
