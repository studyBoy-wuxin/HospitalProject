import React, { Component } from 'react';
import { Steps, Button, message } from 'antd';
import FirstStep from './pages/FindPwd/FirstStep/FirstStep'
import SecondStep from './pages/FindPwd/SecondStep/SecondStep'
import PubSub from 'pubsub-js'

const { Step } = Steps;



class UpdatePwd extends Component {

    state = { current: 0, PatID: '' }

    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }

    componentDidMount() {
        this.token = PubSub.subscribe('current', (_, current) => { this.setState({ current }) })
        this.token2 = PubSub.subscribe('PatID', (_, PatID) => this.setState({ PatID }))
    }

    componentWillUnmount() { PubSub.unsubscribe(this.token); PubSub.unsubscribe(this.token2) }

    render() {
        const { current, PatID } = this.state
        console.log(PatID);
        const steps = [
            {
                title: '身份验证',
                content: <FirstStep />,
            },
            {
                title: '重置密码',
                content: PatID === '' ? '' : <SecondStep PatID={PatID} />,
            },
            {
                title: 'Last',
                content: 'Last-content',
            },
        ];

        return (
            <div>
                <Steps current={current}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div className="steps-content">{steps[current].content}</div>
                <div className="steps-action">
                    {current === steps.length - 1 && (
                        <Button type="primary" onClick={() => message.success('Processing complete!')}>
                            Done
                        </Button>
                    )}
                    {current > 0 && (
                        <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default UpdatePwd;