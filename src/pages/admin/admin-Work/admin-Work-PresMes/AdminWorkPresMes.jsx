import React, { Component } from 'react';
import { Button, PageHeader, Descriptions, Statistic } from 'antd';
import PubSub from 'pubsub-js'
import OperateMed from './admin-OperateMedicine/OperateMed.jsx'
import { connect } from 'react-redux'

//这样做的好处就是，当key改变即返回的时候，组件就销毁，state中的数据都重置
class PresMes extends Component {

    state = {
        PrescriptionInfo: [],
        PatientInfo: [],
        TreatTime: ''
    }

    //判断props改变后是否与之前的props不同，如果不同那么就需要重新赋值
    static getDerivedStateFromProps(nextProps, prevState) {
        console.log(nextProps, prevState)
        //当props改变即Reducer中的数据改变的时候，就重新赋值
        if (nextProps.PresInfo !== prevState.PresInfo) {
            return {
                PrescriptionInfo: nextProps.PresInfo.PrescriptionInfo,
                PatientInfo: nextProps.PresInfo.PatientInfo
            }
        }
        return null;
    }

    //医生点击病人开始就诊时，获取当前的时间作为就诊时间
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

                <div style={{ marginTop: '10px' }}>
                    {/* 这里引入操作药品的组件 */}
                    <OperateMed TreatTime={TreatTime} />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({ PresInfo: state.PresInfo }),
    {}
)(PresMes);