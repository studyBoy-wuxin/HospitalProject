import React, { Component } from 'react';
import { Layout, BackTop, Icon, Avatar } from 'antd';
import ReturnMedEqu from './ReturnMedEqu/ReturnMedEqu'
import MySider from './MySider/Sider';
import { Route, Redirect } from 'react-router-dom'
import memoryUtils from '../../utils/memoryUtils'
import './LogisticsPage.css'

const { Header, Footer, Content } = Layout;
class LogisticsPage extends Component {

    state = {
        EmpInfo: memoryUtils.User
    }

    render() {
        if (!memoryUtils.User || !memoryUtils.User.empID) {
            return <Redirect to='/login' />
        }
        const { EmpInfo } = this.state
        console.log(EmpInfo);

        return (
            <Layout style={{ height: '100%' }}>
                {/* 将左侧导航区Sider组件引入 */}
                <MySider />
                {/* 将右侧内容区MyLayout引入 */}
                <Layout className="site-layout">

                    <Header className="LogisticsPage-Header">
                        <div className='LogisticsPage-Header-div'>
                            <div className='LogisticsPage-avatar-box' style={{ float: 'left' }}>
                                <Avatar className='avatar' icon={<Icon type="user" />} />
                            </div>
                            <div className="LogisticsPage-logo" >
                                欢迎您，{EmpInfo.name}
                            </div>
                        </div>
                    </Header>

                    <Content style={{ height: '100%' }}>
                        <div className='LogisticsPage-Content'>
                            <Route path='/LogisticsPage/ReturnMedEqu' component={ReturnMedEqu} />
                        </div>
                    </Content>

                    <Footer className="Footer">
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
            </Layout>
        );
    }
}

export default LogisticsPage;