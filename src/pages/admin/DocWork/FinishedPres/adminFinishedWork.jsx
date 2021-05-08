import React, { Component } from 'react';
import { Layout } from 'antd';
import FinishedPresList from '../PublicComponent/PresList/PresList.jsx'
import FinishedPresMes from '../PublicComponent/PresMes/PresMes.jsx'
import PubSub from 'pubsub-js'


const { Content } = Layout;

class adminFinishedWork extends Component {

    state = {
        key: 0
    }

    componentDidMount() { this.token = PubSub.subscribe('AdminFinishedWork_Key', (_, key) => { this.setState({ key }) }) }
    componentWillUnmount() { PubSub.unsubscribe(this.token) }

    render() {
        const { key } = this.state

        const Contents = [
            {
                key: '0',
                MyComponent: <FinishedPresList type='FinishedPresList' />              //展示已就诊的病人列表
            },
            {
                key: '1',
                MyComponent: <FinishedPresMes type='FinishedPresList' />               //展示病人信息的组件

            },
        ]
        return (
            <Content>
                <div className='adminWork-Content'>
                    <div className='adminWork-Content-box'>
                        {Contents[key].MyComponent}
                    </div>
                </div>
            </Content>
        );
    }
}

export default adminFinishedWork;