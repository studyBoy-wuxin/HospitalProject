import React, { Component } from 'react';
import { Result } from 'antd';
import './error.css'
import { withRouter } from 'react-router-dom'

class error extends Component {

    Jump = event => {
        event.preventDefault();
        this.props.history.push('/login')

    }

    render() {
        return (
            <div className='error-box'>
                <Result
                    status="404"
                    title="404"
                    subTitle="抱歉，您访问的页面不存在。"
                    extra={<div>
                        返回<a href='/#' onClick={this.Jump}>用户登录?</a>
                    </div>}
                />


            </div >
        );
    }
}

export default withRouter(error);