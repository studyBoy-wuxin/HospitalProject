import React, { Component } from 'react';
import SearchList from '../../../../Component/UserPage/OfficialServer/SearchList/SearchHeader/SearchSubjectHeader/SearchSubjectHeader.jsx'
import DoctorInfo from '../../../../Component/UserPage/OfficialServer/DoctorInfo/DoctorInfo.jsx'
import { connect } from 'react-redux'


class SearchSubject extends Component {

    state = {
        ShowPage_Key: 0,        //通过key值的变化，来改变展示的子组件
        SelectedDocInfo: []     //将医生信息通过props传递给DoctorInfo组件
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.ShowKey !== prevState.ShowPage_Key) {
            return {
                ShowPage_Key: nextProps.ShowKey,
            };
        }
        if (nextProps.SelectedDocInfo.docID !== prevState.SelectedDocInfo.docID) {
            console.log(nextProps, prevState)
            return { SelectedDocInfo: nextProps.SelectedDocInfo }
        }
        return null;
    }

    clearSelectedDocInfoInState = () => {
        this.setState({ SelectedDocInfo: [] })
    }

    render() {
        console.log("------------------------------SearchSubject---------------------")
        const { ShowPage_Key, SelectedDocInfo } = this.state
        const ShowPage = [
            { content: <SearchList />, key: 0 },
            {
                //如果用户还没选择医生，那么就放个'',如果有值了，再把医生的信息传给DoctorInfo组件
                content: SelectedDocInfo.length === 0 ? '' : <DoctorInfo SelectedDocInfo={{ ...SelectedDocInfo }} clearSelectedDocInfoInState={this.clearSelectedDocInfoInState} />,
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

export default connect(
    state => ({ ShowKey: state.PageKey, SelectedDocInfo: state.DocInfo }),
    {}
)(SearchSubject);