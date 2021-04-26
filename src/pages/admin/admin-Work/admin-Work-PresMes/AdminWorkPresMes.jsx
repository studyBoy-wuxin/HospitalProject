import React, { Component } from 'react';
import { Button, PageHeader, Descriptions, Statistic } from 'antd';
import PubSub from 'pubsub-js'
import MedSearchHeader from '../../admin-OperateMedicine/SearchHeader/MedSearchHeader.jsx'

class PresMes extends Component {

    state = {
        PrescriptionInfo: [],
        PatientInfo: [],
        TreatTime: ''
    }

    //判断props改变后是否与之前的props不同，如果不同那么就需要重新赋值
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.PrescriptionInfo !== prevState.PrescriptionInfo || nextProps.PatientInfo !== prevState.PatientInfo) {
            return {
                PrescriptionInfo: nextProps.PrescriptionInfo,
                PatientInfo: nextProps.PatientInfo
            };
        }
        return null;
    }

    componentDidMount() {
        const date = new Date();
        //年
        const year = date.getFullYear();
        //月
        const month = date.getMonth() + 1;
        //日
        const day = date.getDate();
        //时
        const hh = date.getHours();
        //分
        const mm = JSON.stringify(date.getMinutes()).length === 1 ? '0' + date.getMinutes() : date.getMinutes();
        const TreatTime = year + "/" + month + "/" + day + "/  " + hh + ":" + mm;
        this.setState({ TreatTime })
    }

    componentWillUnmount() {
        this.props.clearSelectedDocInfoInState()
    }

    render() {
        const { name, sex, age, address } = this.state.PatientInfo
        const { PrescriptionInfo, TreatTime } = this.state

        //处方单中的表头患者基本信息
        const renderContent = (
            <Descriptions size="small" column={2} >
                <Descriptions.Item label="患者姓名">{name}</Descriptions.Item>

                <Descriptions.Item label="年龄">{age}</Descriptions.Item>

                <Descriptions.Item label="性别">{sex === 0 ? '男' : sex === 1 ? '女' : ''}</Descriptions.Item>

                <Descriptions.Item label="现居住址">{address}</Descriptions.Item>

                <Descriptions.Item label="预约时间">{PrescriptionInfo.bookedTime}</Descriptions.Item>

                <Descriptions.Item label="就诊时间">{TreatTime}</Descriptions.Item>

            </Descriptions>
        )

        //支付情况信息
        const extraContent = (
            <div style={{ display: 'flex' }}>
                <Statistic
                    title="Status"
                    value={PrescriptionInfo.status === 0 ? "待支付" : "已支付"}
                    style={{
                        marginRight: 32,
                    }}
                />
                <Statistic title="Price" prefix="￥" value={PrescriptionInfo.totalprice} />
            </div>
        );

        const Content = ({ children, extra }) => {
            return (
                <div className="content">
                    <div className="main" style={{ width: '810px', float: 'left' }}>{children}</div>
                    <div className="extra">{extra}</div>
                </div>
            );
        };

        return (
            <div>
                <div
                    style={{
                        backgroundColor: '#F5F5F5',
                        padding: 10,
                    }}
                >
                    <PageHeader
                        ghost={false}
                        onBack={() => PubSub.publish('AdminWork_Key', 0)}
                        title="患者就诊单"
                        extra={[
                            <Button key="3">Operation</Button>,
                            <Button key="2">Operation</Button>,
                            <Button key="1" type="primary">
                                Primary
                            </Button>,
                        ]}
                    >
                        <Content extra={extraContent}>{renderContent}</Content>
                    </PageHeader>
                </div>

                <div>
                    <MedSearchHeader />
                </div>
            </div>
        );
    }
}

export default PresMes;