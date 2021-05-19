import React, { Component } from 'react';
import {
    Switch,
    Menu,
    Avatar,
    Icon,
    Modal
} from 'antd';
import './index.css'
import OwnerMessage from './OwnerMessage/OwnerMessage.jsx'
import PubSub from 'pubsub-js'
import memoryUtils from '../../../utils/memoryUtils'
import storageUtils from '../../../utils/storageUtils'

class OwnerSetting extends Component {
    state = {
        theme: 'light',
    };

    //改变主题颜色
    changeTheme = value => {
        this.setState({
            theme: value ? 'dark' : 'light',
        });
    };

    //改变个人信息
    updateOwnerMessage = () => {
        PubSub.publish("ModalVisible", true)
    }

    removeUser = () => {
        Modal.confirm({

            content: '确认退出吗',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                memoryUtils.User = {};
                storageUtils.removeUser();
                this.props.history.replace('/login')
            }
        });

    }

    render() {
        const { Patient } = this.props.location.state
        console.log(this.props);
        return (
            <div className='Setting-box'>
                <Menu
                    defaultSelectedKeys={['1']}
                    mode='inline'
                    theme={this.state.theme}
                    className='menu'
                >
                    <div className='avatar-box'>
                        <Avatar className='Setting-avatar' icon={<Icon type="user" />} size={64} style={{ margin: '20px' }} />
                        <p>{Patient.name}</p>
                    </div>
                    <Menu.Item key="1">
                        <OwnerMessage Patient={Patient} />
                    </Menu.Item>

                    {/* <Menu.Item key="2">
                        修改密码
                    </Menu.Item> */}
                    <Menu.Item key="3">
                        <span onClick={this.updateOwnerMessage}>修改个人信息</span>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <span onClick={this.removeUser}>注销用户</span>
                    </Menu.Item>
                    <div style={{ position: 'relative', bottom: '-190px' }}>
                        <Switch onChange={this.changeTheme} /> 变换主题
                    </div>
                </Menu>
            </div>
        );
    }
}

export default OwnerSetting;