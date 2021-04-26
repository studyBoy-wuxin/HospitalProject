import React, { Component } from 'react';
import { Input } from 'antd';
import { POST } from '../../../../../api/index.jsx'
import PublicList from '../../List/PublicList.jsx'

const { Search } = Input;

class SearchDocHeader extends Component {

    state = {
        AllDoctorInfo: [],
    }

    //查询医生的时候触发
    onSearch = value => {
        this.setState({ AllDoctorInfo: [] })
        console.log(value)
        const data = { type: 'doctor', DocName: value }
        POST('/DoctorController/findDocterByName', data)
            .then(resp => {
                console.log(resp.data)
                this.setState({
                    AllDoctorInfo: resp.data,
                })
            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { AllDoctorInfo } = this.state

        return (
            <div>
                <div>
                    <Search
                        placeholder="请输入医生的姓名"
                        enterButton="Search"
                        size="large"
                        onSearch={this.onSearch}
                    />
                </div>
                <div>
                    {AllDoctorInfo.length === 0 ? '' : <PublicList AllDoctorInfo={AllDoctorInfo} />}
                </div>
            </div>
        );
    }
}

export default SearchDocHeader;