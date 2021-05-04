import React, { Component } from 'react';
import { Layout, BackTop, Icon, Avatar } from 'antd';
import ownerMes from './admin-ownerMes/ownerMes.jsx'
import adminBookedWork from './admin-Work/BookedPres/adminBookedWork.jsx'
import adminFinishedWork from './admin-Work/FinishedPres/adminFinishedWork.jsx'
import MySider from './MySider/Sider';
import { Route, Redirect } from 'react-router-dom'
import memoryUtils from '../../utils/memoryUtils'
import './admin.css'

const { Header, Footer } = Layout;
class admin extends Component {

    state = {
        Doctor: memoryUtils.User
    }

    render() {
        if (!memoryUtils.User || !memoryUtils.User.empID) {
            return <Redirect to='/login' />
        }

        const { Doctor } = this.state

        return (
            <Layout>
                {/* 将左侧导航区Sider组件引入 */}
                <MySider />
                {/* 将右侧内容区MyLayout引入 */}
                <Layout className="site-layout">

                    <Header className="admin-Header">
                        <div className='admin-Header-div'>
                            <div className='admin-avatar-box' style={{ float: 'left' }}>
                                <Avatar className='avatar' icon={<Icon type="user" />} />
                            </div>
                            <div className="admin-logo" >
                                欢迎您，{Doctor.name}医生
                            </div>
                        </div>
                    </Header>

                    <Route path='/admin/OwnerMes' component={ownerMes} />
                    <Route path='/admin/BookedPres' component={adminBookedWork} />
                    <Route path='/admin/FinishedPres' component={adminFinishedWork} />

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

export default admin;