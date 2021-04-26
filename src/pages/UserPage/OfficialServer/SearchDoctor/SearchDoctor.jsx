import React, { Component } from 'react';
import PubSub from 'pubsub-js'
import DoctorInfo from '../../../../Component/User_Serve_Search/DoctorInfo/DoctorInfo.jsx'
import SearchList from '../../../../Component/User_Serve_Search/SearchList/SearchHeader/SearchDocHeader/SearchDocHeader.jsx'

class SearchDoctor extends Component {

    state = {
        ShowPage_Key: 0,
        SelectedDocInfo: []     //将医生信息通过props传递给DoctorInfo组件
    }

    //在componentDidMount这个生命周期中获取到所有科室的信息
    componentDidMount() {
        //接收SearchList发送来的数据
        this.token = PubSub.subscribe('ShowPage_Key', (_, key) => {
            this.setState({ ShowPage_Key: key })
        })

        this.token2 = PubSub.subscribe('SelectedDocInfo', (_, SelectedDocInfo) => {
            this.setState({ SelectedDocInfo })
        })
    }

    componentWillUnmount() {
        //取消订阅
        PubSub.unsubscribe(this.token);
        PubSub.unsubscribe(this.token2);
    }

    render() {
        const { ShowPage_Key, SelectedDocInfo } = this.state

        const ShowPage = [
            {
                content: <SearchList />,
                key: 0,
            },
            {
                //如果用户还没选择医生，那么就放个'',如果有值了，再把医生的信息传给DoctorInfo组件
                content: SelectedDocInfo.length === 0 ? '' : <DoctorInfo SelectedDocInfo={SelectedDocInfo} />,
                key: 1,
            }
        ]

        return (
            <div style={{ padding: 24 }}>
                <div>
                    {/* 展示区 */}
                    {ShowPage[ShowPage_Key].content}
                </div>
            </div >
        );
    }
}

export default SearchDoctor;