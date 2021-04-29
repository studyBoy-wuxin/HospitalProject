import React, { Component } from 'react';
import { Layout } from 'antd';
import './adminWork.css'
import AdminWorkPresList from './admin-Work-PresList/AdminWorkPresList'
import AdminWorkPresMes from './admin-Work-PresMes/AdminWorkPresMes.jsx'
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
                MyComponent: <AdminWorkPresList />
            },
            {
                key: '1',
                MyComponent: <AdminWorkPresMes />

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