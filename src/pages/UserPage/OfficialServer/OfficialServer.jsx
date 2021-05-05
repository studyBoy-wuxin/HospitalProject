import React, { Component } from 'react';
import { Layout, Menu } from 'antd';
import { Route, Link } from "react-router-dom"
import SearchDoctor from './SearchDoctor/SearchDoctor.jsx'
import SearchSubject from './SearchSubject/SearchSubject.jsx'
import PayForCost from './PayForCost/PayForCost.jsx'


const { SubMenu } = Menu;
const { Content, Sider } = Layout;


class OfficialServer extends Component {

    render() {
        return (
            <div>
                <div style={{ padding: 24, minHeight: 600 }}>
                    <Layout>
                        <Content>
                            <Layout >
                                <Sider width={180} style={{ background: '#fff', height: '600px', paddingLeft: '2px' }}>
                                    <Menu
                                        mode="inline"
                                        defaultSelectedKeys={['1']}
                                        style={{ height: '100%' }}
                                    >
                                        <SubMenu key="1" title="预约挂号">
                                            <Menu.Item key="5">
                                                <Link to='/userPage/OfficialServer/SearchDoctor'>搜医生挂号</Link>
                                            </Menu.Item>
                                            <Menu.Item key="6">
                                                <Link to='/userPage/OfficialServer/SearchSubject'>搜专科挂号</Link>
                                            </Menu.Item>
                                        </SubMenu>
                                        <Menu.Item key="2">
                                            <Link to='/userPage/OfficialServer/PayForCost'>门诊缴费</Link>
                                        </Menu.Item>
                                    </Menu>
                                </Sider>
                                <Content style={{ background: '#fff', height: '600px' }}>
                                    <div>
                                        <Route path='/userPage/OfficialServer/SearchDoctor' component={SearchDoctor} />
                                        <Route path='/userPage/OfficialServer/SearchSubject' component={SearchSubject} />
                                        <Route path='/userPage/OfficialServer/PayForCost' component={PayForCost} />
                                    </div>
                                </Content>
                            </Layout>
                        </Content>
                    </Layout>
                </div>
            </div>
        );
    }
}

export default OfficialServer;