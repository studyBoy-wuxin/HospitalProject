import React, { Component } from 'react';
import { Layout, BackTop, Icon, Avatar } from 'antd';
import ownerMes from './DocOwnerMes/ownerMes.jsx'
import adminBookedWork from './DocWork/BookedPres/adminBookedWork.jsx'
import adminFinishedWork from './DocWork/FinishedPres/adminFinishedWork.jsx'
import DocApply from './DocApply/DocApply.jsx'
import CheckDocApply from './CheckDocApply/CheckDocApply.jsx'
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
            <Layout style={{ height: '100%' }}>
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
                    <Route path='/admin/DocApply' component={DocApply} />
                    <Route path='/admin/CheckDocApply' component={CheckDocApply} />

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