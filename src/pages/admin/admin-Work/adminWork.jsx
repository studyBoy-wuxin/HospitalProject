import React, { Component } from 'react';
import { Layout } from 'antd';
import './adminWork.css'
import AdminWorkPresList from './BookedPres/PresList/PresList.jsx'
import AdminWorkPresMes from './BookedPres/PresMes/AdminWorkPresMes.jsx'
import PubSub from 'pubsub-js'

const { Content } = Layout;

class adminWork extends Component {

    state = {
        key: 0
    }

    componentDidMount() {
        this.token = PubSub.subscribe('AdminWork_Key', (_, key) => { this.setState({ key }) })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token)
    }

    render() {
        const { key } = this.state

        const Contents = [
            {
                key: '0',
                MyComponent: <AdminWorkPresList />              //展示已挂号的病人列表
            },
            {
                key: '1',
                MyComponent: <AdminWorkPresMes />               //展示病人信息的组件

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

export default adminWork;