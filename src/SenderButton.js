import React from 'react';


class SenderButton extends React.Component {

    render() {
        return (<div>
            <button onClick={this.props.publishMessage}>Send comment</button>
        </div>);
    }


    // buttonClicked() {
    //     console.log('Button was clicked!');
    //     this.props.mqttClient.publish(Config.AWS_IOT_TOPIC, 'hello world' + Date.now());
    // }

    // render() {
    //     return (<div>
    //         <button onClick={()=>{this.buttonClicked()}}>Send comment</button>
    //     </div>);
    // }
}

export default SenderButton