import React, { Component } from 'react';
import { Result } from 'antd';

class ErrorBoundary extends Component {

    state = { hasError: false }

    //一旦后代组件报错，就会触发
    static getDerivedStateFromError(err) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        console.log(err);
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // 你同样可以将错误日志上报给服务器
        console.log(error, info);
    }

    render() {
        return (
            <>
                {this.state.hasError ? <Result
                    status="warning"
                    title='网络不稳定，网页丢失.....'
                /> : this.props.children}
            </>
        );
    }
}

export default ErrorBoundary;