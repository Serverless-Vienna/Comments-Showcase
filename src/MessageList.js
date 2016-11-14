import React from 'react';


class MessageList extends React.Component {
  render() {
    console.log(this.props.list);
    if (this.props.list.length === 0) {
      return <div>No comments found.</div>;
    } else {
      return (<div className="MessageList">
        <ul>
          {this.props.list.map(function (item, key) {
            return <li key={key}>
              <span className="key">from <b>{item.sender}</b> (@{item.serverTime}):</span><br/>
              <span className="value" dangerouslySetInnerHTML={{ __html: item.value }}></span>
            </li>;
          })}
        </ul>
      </div>
      )
    }
  }
}

export default MessageList;
