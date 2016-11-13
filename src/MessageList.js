import React from 'react';


class MessageList extends React.Component {
    render() {
      return (
        <ul>
          {this.props.list.map(function(item, key){
            return <li key={key}>{item.value}</li>;
          })}
        </ul>
      )
    }
}

export default MessageList