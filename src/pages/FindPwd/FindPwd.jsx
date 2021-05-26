import React, { Component } from 'react';
import { Steps, Button } from 'antd';
import FirstStep from './FirstStep/FirstStep'
import SecondStep from './SecondStep/SecondStep'
import PubSub from 'pubsub-js'
import './index.css'

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
                title: '完成',
                content: <p style={{ fontSize: '40px' }}><center><strong>修改成功!</strong></center></p>,
            },
        ];

        return (
            <div className='UpdatePwd-MaxBox'>
                <div className='UpdatePwd-MinBox'>
                    <Steps current={current}>
                        {steps.map(item => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <div className="steps-content">{steps[current].content}</div>
                    <div className="steps-action">
                        <p style={{ textAlign: 'end' }}>
                            {current > 0 && current !== steps.length - 1 && (
                                <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                                    Previous
                                </Button>
                            )}
                            {current === steps.length - 1 && (
                                <Button type="link" onClick={() => this.props.history.push('/login')}>
                                    返回登录
                                </Button>
                            )}
                        </p>
                    </div>
                </div>
            </div >
        );
    }
}

export default UpdatePwd;