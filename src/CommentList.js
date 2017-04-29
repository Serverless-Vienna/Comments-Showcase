import React from "react";
import sanitizeHtml from "sanitize-html";

class CommentList extends React.Component {

  render() {
    if (this.props.list.length === 0) {
      return <div>No comments found.</div>;
    } else {
      return (
        <div className="CommentList">
          <ul>
            {/* TODO: use key from item, e.g. client uuid ( + userid or server uuid ? ), also needs a mechanism to deal with duplicate clientIds */}
            {this.props.list.map(function (item, index) {
              const timestampFormatted = item.timestamp !== undefined ? new Date(item.timestamp).toLocaleString() : "No server time";
              const sanitizedContent = sanitizeHtml(item.value, {
                allowedTags: [ "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
                "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "ins", "pre" ]
              });
              return (<li key={item.uuid}>
                <span className="key">from <b>{item.sender}</b> (@{timestampFormatted}):</span><br/>
                <span className="value" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
              </li>);
            })}
          </ul>
        </div>
      )
    }
  }
}

export default CommentList;
