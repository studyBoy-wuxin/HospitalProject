import { message, Modal, Table } from 'antd';
import React, { Component } from 'react';
import { POST } from '../../../api/index'
import { withRouter } from 'react-router-dom'

class ShowPatInfo extends Component {

    state = { DataSource: [], visible: false }

    componentDidMount() {
        POST('/PatientController/findPatientById', { type: 'patient', PatID: this.props.PatID })
            .then(resp => {
                console.log(resp.data);
                const { data } = resp
                const DataSource = [{
                    key: 'ID',
                    FirstCol: '用户ID',
                    SecondCol: data.patID
                }, {
                    key: 'Password',
                    FirstCol: '用户密码',
                    SecondCol: data.password
                },]
                this.setState({ DataSource, visible: this.props.visible })
            })
            .catch(err => message.error(err.message))
    }

    render() {
        const { DataSource, visible } = this.state
        //展示申请确认表的列
        const columns = [
            {
                dataIndex: 'FirstCol',
                key: 'FirstCol',
                align: 'center'
            },
            {
                dataIndex: 'SecondCol',
                key: 'SecondCol',
                align: 'center'
            }
        ]
        return (
            <div>
                <Modal
                    title='账号密码'
                    visible={visible}
                    onCancel={() => this.props.history.push('/login')}
                    onOk={() => {
                        Modal.confirm({
                            title: '已记住账号密码?',
                            onOk: () => this.props.history.push('/login')
                        })
                    }}
                    okText='确认'
                >
                    <Table
                        dataSource={DataSource}
                        columns={columns}
                        showHeader={false}
                        pagination={false}
                        bordered={false}
                    />
                </Modal>
            </div>
        );
    }
}

export default withRouter(ShowPatInfo);