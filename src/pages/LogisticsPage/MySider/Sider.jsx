import React, { Component } from 'react';
import SnowIcon from "../../../assets/Img/snowflake.png"
import { Icon, Menu, Layout, Modal } from 'antd';
import "./Sider.css"
import memoryUtils from '../../../utils/memoryUtils'
import storageUtils from '../../../utils/storageUtils'
import { withRouter, Link } from 'react-router-dom'

const { Sider } = Layout;
const { SubMenu } = Menu;

class MySider extends Component {
    state = {
        collapsed: false,           //判断是否展开状态
        logo_font_size: "18px",     //控制展开收缩时的字体大小
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
            centered: true,
            onOk: () => {
                memoryUtils.User = {};
                storageUtils.removeUser();
                this.props.history.replace('/login')
            }
        });
    }

    render() {
        const { collapsed, logo_font_size } = this.state;       //解构赋值
        return (
            <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse} theme="light" >
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

                    <SubMenu key="sub3" title={                 //title可以设置SubMenu的图标
                        <span>
                            <Icon type="form" />
                            <span>查看工作</span>
                        </span>
                    }>
                        <Menu.Item key="OperateMedEqu">
                            <Link to='/LogisticsPage/OperateMedEqu'>
                                <Icon type="edit" />
                                <span>管理医疗资源</span>
                            </Link>
                        </Menu.Item>

                        <Menu.Item key="return">
                            <Link to='/LogisticsPage/ReturnMedEqu'>
                                <Icon type="form" />
                                <span>归还医疗资源</span>
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