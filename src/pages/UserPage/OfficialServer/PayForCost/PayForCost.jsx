import React, { Component } from 'react';
import { Table, Tooltip, Icon, Descriptions, Statistic, PageHeader, Divider, Button, Modal } from 'antd';
import { POST } from '../../../../api/index.jsx'
import memoryUtils from '../../../../utils/memoryUtils'
import Paid from '../../../../assets/Img/Paid.png'

const columns = [
    {
        title: '收费名称',
        dataIndex: 'Name',
        key: 'Name',
        align: 'center'
    },
    {
        title: '数量',
        dataIndex: 'Num',
        key: 'Num',
        align: 'center'
    },
    {
        title: '收费金额',
        dataIndex: 'Price',
        key: 'Price',
        width: '20%',
        align: 'right'
    },
];

const { Item } = Descriptions

class PayForCost extends Component {

    state = {
        data: [],
        docInfo: [],             //医生信息
        presInfo: [],            //病历单信息
        PatInfo: memoryUtils.User,             //病人信息
        TotalPrice: 0,
        visible: false
    }

    componentDidMount() {
        const { PatInfo } = this.state
        POST('/PatientController/findCostById', { type: 'patient', PatID: PatInfo.patID })
            .then(resp => {
                console.log(resp.data)
                const { docWorkInfo, presInfo, medInfoList, medInPresList, docInfo } = resp.data
                const data = []
                data.push({
                    key: 1,
                    Name: (
                        <span>
                            <span style={{ marginRight: '10px' }}>挂号费用</span>
                            <Tooltip
                                title={`于${presInfo.treatmentTime},就诊于${docInfo.branchSubject}科${docInfo.name}医生，挂号费为${docWorkInfo.price}元`}
                            >
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    ),
                    Num: 1,
                    Price: '￥' + docWorkInfo.price,
                })
                data.push({
                    key: 2,
                    Name: '药物费用',
                    Num: 1,
                    Price: '￥' + presInfo.totalPrice,
                    children: medInfoList.map((item, index) => {
                        return {
                            key: item.medID,
                            Name: item.medName,
                            Num: medInPresList[index].medNum,
                            Price: medInPresList[index].medNum * item.price,
                        }
                    })
                })
                const TotalPrice = resp.data.presInfo.totalPrice + resp.data.docWorkInfo.price
                data.push({
                    key: 3,
                    Name: '',
                    Num: '',
                    Price: `总价：￥ ${TotalPrice}`,
                })
                this.setState({ data, docInfo, presInfo, TotalPrice })

            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { data, docInfo, presInfo, PatInfo, TotalPrice } = this.state
        const { treatmentTime } = presInfo
        const renderContent = (
            <Descriptions size="small" column={2} >
                <Item label="患者姓名">{PatInfo.name}</Item>

                <Item label="年龄">{PatInfo.age}</Item>

                <Item label="性别">{PatInfo.sex === 0 ? '男' : '女'}</Item>

                <Item label="就诊时间">{treatmentTime === undefined ? '' : treatmentTime.substring(0, treatmentTime.length - 3)}</Item>

                <Item label="就诊科目">{docInfo.branchSubject}</Item>

                <Item label="就诊医生">{docInfo.name}</Item>

            </Descriptions>
        )

        //支付情况信息
        const extraContent = (
            <div style={{ display: 'flex' }}>
                <Statistic
                    title="Status"
                    value={presInfo.status === 0 ? '待支付' : '已支付'}
                    style={{
                        marginRight: 32,
                    }}
                />
                {/* 
                    如果病例单是完成状态的，那么就价格就显示为0，如果尚未支付完成，那么在判断病历单中的价格是否为0，
                    如果为0就说明还没有看医生，那么就显示由OperateMed组件结算完药品金额后发送过来的TotalPrice，如果病历单中的价格不为0
                    那么就代表已经生成病历单了，就可以用里面的price了
                */}
                <Statistic
                    title="Price"
                    prefix="￥"
                    value={TotalPrice} />
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
                        // backgroundColor: '#F5F5F5',
                        padding: 10,
                    }}
                >
                    {/* 这里是展示患者信息头的组件 */}
                    <PageHeader
                        ghost={false}
                        //如果props中的type是Booked传来的，那就使用AdminWork_Key，否则就是Finished传来的，就用AdminFinishedWork_Key
                        // onBack={() => PubSub.publish(type === 'AdminWorkPresList' ? 'AdminWork_Key' : 'AdminFinishedWork_Key', 0)}
                        title="缴费单"
                    >
                        <Content extra={extraContent}>{renderContent}</Content>
                    </PageHeader>
                </div>
                <Divider />
                <div style={{ width: '98%', margin: '13px' }}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        bordered
                        pagination={false}
                    />
                </div>
                <Modal
                    title="二维码收款"
                    visible={this.state.visible}
                    onOk={() => this.setState({ visible: false })}
                    onCancel={() => {
                        Modal.confirm({
                            title: '确认信息',
                            content: '确认取消支付吗? 未支付无法取药以及无法继续挂号!',
                            okText: '确认',
                            cancelText: '取消',
                        });
                        this.setState({ visible: false })
                    }}
                    cancelText='取消支付'
                    okText='已完成支付'
                >
                    <img src={Paid} alt='收款二维码' />
                </Modal>
                <Button
                    type='primary'
                    style={{ width: '98%', margin: '13px' }}
                    onClick={() => this.setState({ visible: true })}
                >费用缴纳</Button>
            </div>
        );
    }
}

export default PayForCost;