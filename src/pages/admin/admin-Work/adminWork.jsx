import React, { Component } from 'react';
import { Layout } from 'antd';
import './adminWork.css'
import AdminWorkPresList from './admin-Work-PresList/AdminWorkPresList'
import AdminWorkPresMes from './admin-Work-PresMes/AdminWorkPresMes.jsx'
import PubSub from 'pubsub-js'

const { Content } = Layout;

class adminWork extends Component {

    state = {
        key: 0,
        AdminWork_PresMes: []
    }

    componentDidMount() {

        this.token = PubSub.subscribe('AdminWork_Key', (_, key) => { this.setState({ key }) })
        this.token2 = PubSub.subscribe('AdminWork_PresMes', (_, AdminWork_PresMes) => this.setState({ AdminWork_PresMes }))
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token)
        PubSub.unsubscribe(this.token2)
    }

    clearSelectedDocInfoInState = () => {
        this.setState({ AdminWork_PresMes: [] })
    }

    render() {
        const { key, AdminWork_PresMes } = this.state

        const Contents = [
            {
                key: '0',
                MyComponent: <AdminWorkPresList />
            },
            {
                key: '1',
                MyComponent: AdminWork_PresMes.length === 0 ? '' : <AdminWorkPresMes {...AdminWork_PresMes} clearSelectedDocInfoInState={this.clearSelectedDocInfoInState} />
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