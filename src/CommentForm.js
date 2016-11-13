import React from 'react';


class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log('A comment was submitted: ' + this.state.value);
    this.props.publishMessage(this.state.value);
    if (event) event.preventDefault();
  }

  render() {
    return (
      
        <div>
          <input type="text" value={this.state.value} onChange={this.handleChange}/>
          <input type="button" value="Submit"  onClick={this.handleSubmit}/>
        </div>
      
    );
  }
}

export default CommentForm