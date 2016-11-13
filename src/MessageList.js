import React from 'react';


class MessageList extends React.Component {
  render() {
    console.log(this.props.list);
    if (this.props.list.length === 0) {
      return <div>No comments found.</div>;
    } else {
      return (<div className="MessageList">
        <ul>
          {this.props.list.reverse().map(function (item, key) {
            return <li key={key}>
              <span className="key">{item.key}</span>
              <span className="value" dangerouslySetInnerHTML={{ __html: item.value }}></span>
            </li>;
          })}
        </ul>
      </div>
      )
    }
  }
}

export default MessageList