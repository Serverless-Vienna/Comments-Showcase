import React from 'react';
import sanitizeHtml from 'sanitize-html';

class MessageList extends React.Component {

  sanitizeContent(htmlContent) {
    return sanitizeHtml(htmlContent, {
      allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
      });
  }

  render() {
    if (this.props.list.length === 0) {
      return <div>No comments found.</div>;
    } else {
      return (<div className="MessageList">
        <ul>
          {this.props.list.map(function (item, key) {
            return <li key={key}>
              <span className="key">from <b>{item.sender}</b> (@{item.serverTime}):</span><br/>
              <span className="value" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.value) }}></span>
            </li>;
          })}
        </ul>
      </div>
      )
    }
  }
}

export default MessageList;
