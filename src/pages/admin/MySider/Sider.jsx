import React, { Component } from 'react';
import SnowIcon from "../../../assets/Img/snowflake.png"
import { Icon, Menu, Layout, Modal, message } from 'antd';
import "./Sider.css"
import memoryUtils from '../../../utils/memoryUtils'
import storageUtils from '../../../utils/storageUtils'
import { withRouter, Link } from 'react-router-dom'
import { POST } from '../../../api/index.jsx'

const { Sider } = Layout;
const { SubMenu } = Menu;

class MySider extends Component {
    state = {
        collapsed: false,           //判断是否展开状态
        logo_font_size: "18px",     //控制展开收缩时的字体大小
        DocInfo: memoryUtils.User,
    };

    onCollapse = (collapsed) => {
        if (collapsed === false) {      //菜单展开的时候，字体放大
            this.setState({ collapsed, logo_font_size: "18px" });
        } else {
            this.setState({ collapsed, logo_font_size: "0px" })
        }
    };

    removeUser = () => {
        Modal.confirm({
            content: '确认退出吗',
            okText: '确认',
            cancelText: '取消',
            centered: 'true',
            onOk: () => {
                memoryUtils.User = {};
                storageUtils.removeUser();
                this.props.history.replace('/login')
            }
        });
    }

    componentDidMount() {
        const { DocInfo } = this.state
        POST('/DoctorController/findDocterById', { DocID: DocInfo.empID, type: 'doctor' })
            .then(resp => {
                const { data } = resp
                this.setState({ DocInfo: { ...data, ...DocInfo } })
            })
            .catch(err => message.error(err.message))
    }

    render() {
        const { collapsed, logo_font_size, DocInfo } = this.state;       //解构赋值
        return (
            <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse} theme="light">
                <div className="Sider-logo">
                    <img alt="图标" src={SnowIcon} />
                    {/*  让文字的消失有个过渡的效果 */}
                    <span style={{ fontSize: logo_font_size, transition: "all 0.1s", marginLeft: collapsed ? '0px' : '10px' }}>
                        后台管理
                    </span>
                </div>

                <Menu
                    theme='light'
                    defaultSelectedKeys={['1']}             //默认选中的树节点，靠Menu.Item的key值辨认
                    mode="inline"                         //菜单的类型为内嵌(下拉展示)
                >
                    <SubMenu key="sub1" title={                 //title可以设置SubMenu的图标
                        <span>
                            <Icon type="desktop" />
                            <span>查看工作</span>
                        </span>
                    }>
                        <Menu.Item key="3">
                            <Link to='/admin/BookedPres'>已挂号的病人</Link>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Link to='/admin/FinishedPres'>已就诊完成的病人</Link>
                        </Menu.Item>
                    </SubMenu>


                    <SubMenu key="sub2" title={                 //title可以设置SubMenu的图标
                        <span>
                            <Icon type="user" />
                            <span>个人中心</span>
                        </span>
                    }>
                        <Menu.Item key="5">
                            <Link to='/admin/OwnerMes'>个人信息</Link>
                        </Menu.Item>
                        <Menu.Item key="6">修改密码</Menu.Item>
                    </SubMenu>

                    <SubMenu key="sub3" title={                 //title可以设置SubMenu的图标
                        <span>
                            <Icon type="form" />
                            <span>资源申请</span>
                        </span>
                    }>
                        {//如果是科长或者是部长，那么就有审核申请的选项
                            DocInfo.position === '科长' || DocInfo.position === '部长' ?
                                <Menu.Item key="InspectApply">
                                    <Link to='/admin/InspectApply'>
                                        <Icon type="form" />
                                        <span>审核申请</span>
                                    </Link>
                                </Menu.Item>
                                : ''
                        }
                        <Menu.Item key="7">
                            <Link to='/admin/DocApply'>
                                <Icon type="form" />
                                <span>申请医疗资源</span>
                            </Link>
                        </Menu.Item>

                        <Menu.Item key="8">
                            <Link to='/admin/CheckDocApply'>
                                <Icon type="search" />
                                <span>查看个人申请</span>
                            </Link>
                        </Menu.Item>
                    </SubMenu>



                    <Menu.Item key="9" onClick={this.removeUser}>
                        <Icon type="logout" />
                        <span>注销用户</span>
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}

export default withRouter(MySider);