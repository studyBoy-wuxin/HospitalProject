import React, { Component } from 'react';
import memoryUtils from '../../../../../utils/memoryUtils'
import textImg from '../../../../../assets/Img/text.gif'
import { POST } from '../../../../../api/index.jsx'
import { Divider, List, message } from 'antd';
import PubSub from 'pubsub-js'
import { connect } from 'react-redux'
import { ChangePresInfoAction } from '../../../../../redux/action/PresInfoAction'

//这是一个被抽离出来的公用的组件，只要是为了展示已挂号或者是已就诊的患者，根据props中的type值不同来展示不同的信息
class PresList extends Component {

    state = {
        Doctor: memoryUtils.User,           //从memoryUtils中获取医生的信息
        patBasicMesList: [],
        AllPresInfo: []
    }

    //点击处方单的时候，发送消息
    ShowPrescriptionInfo = (index) => {
        return (event) => {
            event.preventDefault();             //阻止默认的跳转行为
            const { patBasicMesList, AllPresInfo } = this.state

            //根据点击处方单的索引值，找到对应的处方单以及病人的信息
            const PresMes = {
                PrescriptionInfo: AllPresInfo[index],
                PatientInfo: patBasicMesList[index]
            }
            const { type } = this.props
            //如果是从AdminWorkPresList传来的props，那么就向它发送key=1,
            //如果是FinishedPresList传来的props，那么就向他发送key=1
            PubSub.publish(type === 'AdminWorkPresList' ? 'AdminWork_Key' :
                type === 'FinishedPresList' ? 'AdminFinishedWork_Key' : '', 1)           //发送消息，adminWork.jsx接收  ，进而跳转到另一个组件 

            //根据ChangePresInfoAction改变存在store中的处方单信息，之后由AdminWorkPresMes组件接收
            this.props.ChangePresInfoAction(PresMes)
        }
    }

    componentDidMount() {
        console.log('componentDidMount-------------------');
        const { Doctor } = this.state
        const { type } = this.props

        //在根据医生ID获取到处方单的信息后，根据处方单中的PatID找到病人有关的信息
        const findPrescriptionByDocID = '/PrescriptionController/findPrescriptionByDocID'
        //根据医生ID获取到由该医生完成就诊的患者以及病历单信息
        const findAllPresMesByPresIDList = '/MedInPrescriptionController/findAllPresMesByPresIDList'

        //如果是从AdminWorkPresList传来的props，那么就向/PrescriptionController/findPrescriptionByDocID发送post请求
        //如果是FinishedPresList传来的props，那么就向/MedInPrescriptionController/findAllPresMesByPresIDList发送post请求
        POST(type === 'AdminWorkPresList' ? findPrescriptionByDocID :
            type === 'FinishedPresList' ? findAllPresMesByPresIDList : '', { DocID: Doctor.empID })
            .then(resp => {
                //这些都是挂了这个医生的 所有 病单以及病人的信息
                if (resp.data !== 'Nothing') {
                    resp.data.PresList.forEach((item, index) => {
                        item.Priority = index + 1
                    })
                    console.log(resp.data.PresList);
                    this.setState({
                        AllPresInfo: resp.data.PresList,
                        patBasicMesList: resp.data.patBasicMesList
                    })
                }
            })
            .catch(err => message.error(err.message))
    }

    render() {
        const { AllPresInfo, patBasicMesList } = this.state
        const { type } = this.props
        console.log(AllPresInfo);
        return (
            <div>
                <div>
                    <span style={{ fontWeight: '700' }}>{type === 'AdminWorkPresList' ? '已挂号的病患' : '已就诊的病患'}</span>
                </div>
                <Divider />
                <List
                    style={{ display: AllPresInfo.length === 0 ? 'none' : 'block' }}
                    itemLayout="horizontal"
                    bordered={true}
                    dataSource={AllPresInfo}
                    renderItem={(item, index) => (
                        <List.Item
                            key={item + index}
                            extra={type === 'AdminWorkPresList' ? <span>优先级：{item.Priority}</span> : null}
                        >
                            <a href="/" onClick={this.ShowPrescriptionInfo(index)}>
                                <List.Item.Meta
                                    avatar={<img style={{ width: '45px', height: '45px' }} src={textImg} alt="文本" />}
                                    title={`患者名称：${patBasicMesList[index].name}`}
                                    description={type === 'AdminWorkPresList' ? `预约时间段：${item.bookedTime}` :
                                        type === 'FinishedPresList' ? `就诊时间：${AllPresInfo[index].treatmentTime}` : ''}
                                />
                            </a>
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default connect(
    () => ({}),
    { ChangePresInfoAction }
)(PresList);