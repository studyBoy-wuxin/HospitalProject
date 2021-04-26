import React, { Component } from 'react';
import SearchList from '../../../../Component/UserPage/OfficialServer/SearchList/SearchHeader/SearchSubjectHeader/SearchSubjectHeader.jsx'
import DoctorInfo from '../../../../Component/UserPage/OfficialServer/DoctorInfo/DoctorInfo.jsx'
import PubSub from 'pubsub-js'


class SearchSubject extends Component {

    state = {
        ShowPage_Key: 0,        //通过key值的变化，来改变展示的子组件
        SelectedDocInfo: []     //将医生信息通过props传递给DoctorInfo组件
    }

    //在componentDidMount这个生命周期中获取到所有科室的信息
    componentDidMount() {
        console.log("a")
        //接收SearchList发送来的数据
        this.token = PubSub.subscribe('ShowPage_Key', (_, key) => {
            this.setState({ ShowPage_Key: key })
        })
        //接收PublicList组件发送来的值
        this.token2 = PubSub.subscribe('SelectedDocInfo', (_, SelectedDocInfo) => {
            if (SelectedDocInfo.docID !== this.state.SelectedDocInfo.docID) {
                console.log("token2")
                this.setState({ SelectedDocInfo })
            }

        })
    }

    componentWillUnmount() {
        console.log("componentWillUnmount----------------------")
        //取消订阅
        PubSub.unsubscribe(this.token);
        PubSub.unsubscribe(this.token2);
    }

    clearSelectedDocInfoInState = () => {
        this.setState({ SelectedDocInfo: [] }, () => {
            console.log(this.state.SelectedDocInfo)
        })
    }

    render() {
        console.log("------------------------------SearchSubject---------------------")
        console.log("SearchSubject:", this.state.SelectedDocInfo)
        const { ShowPage_Key, SelectedDocInfo } = this.state
        const ShowPage = [
            {
                content: <SearchList />,
                key: 0,
            },
            {
                //如果用户还没选择医生，那么就放个'',如果有值了，再把医生的信息传给DoctorInfo组件
                content: SelectedDocInfo.length === 0 ? '' : <DoctorInfo SelectedDocInfo={SelectedDocInfo} clearSelectedDocInfoInState={this.clearSelectedDocInfoInState} />,
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

export default SearchSubject;