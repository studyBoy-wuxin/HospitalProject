import React, { Component } from 'react';
import { Layout, Menu, BackTop, Icon, Avatar } from 'antd';
import './index.css';
import OfficialServer from './OfficialServer/OfficialServer.jsx'
import OwnerSetting from './OwnerSetting/OwnerSetting.jsx'
import { withRouter, NavLink, Route, Redirect } from 'react-router-dom'
import memoryUtils from '../../utils/memoryUtils'
const { Header, Content, Footer } = Layout;

class userPage extends Component {

    state = {
        SelectedKeys: '0',
        Patient: memoryUtils.User
    }

    render() {
        //加个判断，如果util工具模块中的Patient数据为空，那么就不允许访问，直接跳转到login页面
        if (!memoryUtils.User || !memoryUtils.User.patID) {
            return <Redirect to='/login' />
        }

        const { SelectedKeys, Patient } = this.state
        const Navs = [
            {
                Icon: <Icon type="home" />,
                title: <NavLink to='/userPage/OfficialServer' style={{ display: 'inline-block' }}>官方服务</NavLink>,
                content: <Route path='/userPage/OfficialServer' component={OfficialServer} />,
                key: '0'
            },
            {
                Icon: <Icon type="setting" />,
                title: <NavLink
                    to={{ pathname: '/userPage/OwnerSetting', state: { Patient: this.state.Patient } }}
                    style={{ display: 'inline-block' }}
                >个人设置</NavLink>,
                content: <Route path='/userPage/OwnerSetting' component={OwnerSetting} />,
                key: '1'
            },
        ];

        return (
            <div>
                <Layout>
                    <Header className='uPage-Header' style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                        <div className='uPage-avatar-box' style={{ float: 'left' }}>
                            <Avatar className='avatar' icon={<Icon type="user" />} />
                        </div>
                        <div className="uPage-logo" >
                            欢迎您，{Patient.name}{Patient.sex === 0 ? '先生' : Patient.sex === 1 ? '女士' : ''}
                        </div>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            style={{ lineHeight: '64px' }}
                            selectedKeys={[SelectedKeys]}
                            onClick={e => this.setState({ SelectedKeys: e.key })}       //通过点击来获取目标节点的key从而改变state中的值
                        >
                            {/* 遍历Navs的数据信息 */}
                            {Navs.map(item => (
                                <Menu.Item key={item.key}> {item.Icon}{item.title} </Menu.Item>
                            ))}

                        </Menu>
                    </Header>

                    {/* 内容展示区 */}
                    <Content style={{ padding: '0 50px', marginTop: 64 }}>
                        <div style={{ marginTop: '10px' }}>
                            {Navs[SelectedKeys].content}
                        </div>
                    </Content>

                    <Footer className='Footer' style={{ textAlign: 'center' }}>
                        <div>
                            <BackTop visibilityHeight='100' >
                                <div className='backTop'>
                                    {/* 回到顶部 */}
                                    <Icon type="vertical-align-top" />
                                </div>
                            </BackTop>
                        </div>
                    </Footer>
                </Layout>
            </div>
        );
    }
}

export default withRouter(userPage);