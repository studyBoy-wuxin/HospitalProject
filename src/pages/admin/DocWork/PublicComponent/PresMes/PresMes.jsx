import React, { Component } from 'react';
import { PageHeader, Descriptions, Statistic } from 'antd';
import PubSub from 'pubsub-js'
import OperateMed from '../../BookedPres/OperateMedicine/OperateMed.jsx'
import ShowMedInfo from '../../FinishedPres/ShowMedInfo/ShowMedInfo.jsx'
import { connect } from 'react-redux'

//这样做的好处就是，当key改变即返回的时候，组件就销毁，state中的数据都重置
class PresMes extends Component {

    state = {
        PrescriptionInfo: [],
        PatientInfo: [],
        TreatTime: '',
        TotalPrice: 0
    }

    //判断props改变后是否与之前的props不同，如果不同那么就需要重新赋值
    static getDerivedStateFromProps(nextProps, prevState) {
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

        //接收由OperateMed组件传来的TotalPrice总价格，以便在信息头中显示
        this.token = PubSub.subscribe("TotalPrice", (_, TotalPrice) => {
            this.setState({ TotalPrice })
        })
        this.setState({ TreatTime })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token)
    }

    render() {
        const { type } = this.props
        const { name, sex, age, address } = this.state.PatientInfo
        const { PrescriptionInfo, TreatTime, TotalPrice } = this.state
        console.log(PrescriptionInfo)
        //处方单中的表头患者基本信息
        const renderContent = (
            <Descriptions size="small" column={2} >
                <Descriptions.Item label="患者姓名">{name}</Descriptions.Item>

                <Descriptions.Item label="年龄">{age}</Descriptions.Item>

                <Descriptions.Item label="性别">{sex === 0 ? '男' : sex === 1 ? '女' : ''}</Descriptions.Item>

                <Descriptions.Item label="现居住址">{address}</Descriptions.Item>

                <Descriptions.Item label="预约时间">{PrescriptionInfo.bookedTime}</Descriptions.Item>

                <Descriptions.Item label="就诊时间">{type === 'AdminWorkPresList' ? TreatTime : PrescriptionInfo.treatmentTime}</Descriptions.Item>

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
                {/* 
                    如果病例单是完成状态的，那么就价格就显示为0，如果尚未支付完成，那么在判断病历单中的价格是否为0，
                    如果为0就说明还没有看医生，那么就显示由OperateMed组件结算完药品金额后发送过来的TotalPrice，如果病历单中的价格不为0
                    那么就代表已经生成病历单了，就可以用里面的price了
                */}
                <Statistic
                    title="Price"
                    prefix="￥"
                    value={PrescriptionInfo.status === 0 ?
                        PrescriptionInfo.totalPrice === 0 ? TotalPrice : PrescriptionInfo.totalPrice :
                        0} />
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
                    {/* 这里是展示患者信息头的组件 */}
                    <PageHeader
                        ghost={false}
                        //如果props中的type是Booked传来的，那就使用AdminWork_Key，否则就是Finished传来的，就用AdminFinishedWork_Key
                        onBack={() => PubSub.publish(type === 'AdminWorkPresList' ? 'AdminWork_Key' : 'AdminFinishedWork_Key', 0)}
                        title="患者就诊单"
                    >
                        <Content extra={extraContent}>{renderContent}</Content>
                    </PageHeader>
                </div>

                <div style={{ marginTop: '10px' }}>
                    {/* 这里引入操作药品的组件 */}
                    {
                        type === 'AdminWorkPresList' ? <OperateMed TreatTime={TreatTime} /> : <ShowMedInfo />
                    }
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({ PresInfo: state.PresInfo }),
    {}
)(PresMes);