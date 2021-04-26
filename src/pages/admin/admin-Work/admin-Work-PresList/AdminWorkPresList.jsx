import React, { Component } from 'react';
import memoryUtils from '../../../../utils/memoryUtils'
import textImg from '../../../../assets/Img/text.gif'
import { POST } from '../../../../api/index.jsx'
import { Divider, List } from 'antd';
import PubSub from 'pubsub-js'

class AdminWorkList extends Component {

    state = {
        Doctor: memoryUtils.User,           //从memoryUtils中获取医生的信息
        AllPrescription_PatMes: [],
        AllPrescriptionInfo: []
    }

    //点击处方单的时候，发送消息
    ShowPrescriptionInfo = (index) => {
        return (event) => {
            event.preventDefault();             //阻止默认的跳转行为
            const { AllPrescription_PatMes, AllPrescriptionInfo } = this.state

            const PresMes = {
                PrescriptionInfo: AllPrescriptionInfo[index],
                PatientInfo: AllPrescription_PatMes[index]
            }
            PubSub.publish('AdminWork_Key', 1)           //发送消息，adminWork.jsx接收   
            console.log(PresMes)
            PubSub.publish('AdminWork_PresMes', PresMes)           //发送病历单和病人的消息，adminWork.jsx接收
        }
    }

    componentDidMount() {
        const { Doctor } = this.state
        //在根据医生ID获取到处方单的信息后，根据处方单中的PatID找到病人有关的信息
        POST('/PrescriptionController/findPrescriptionByDocID', { DocID: Doctor.empID })
            .then(resp => {
                this.setState({
                    AllPrescriptionInfo: resp.data.PresList,
                    AllPrescription_PatMes: resp.data.PatList
                })
            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { AllPrescriptionInfo, AllPrescription_PatMes } = this.state

        return (
            <div>
                <div>
                    <span style={{ fontWeight: '700' }}>已挂号的病患</span>
                </div>
                <Divider />
                <List
                    style={{ display: AllPrescriptionInfo.length === 0 ? 'none' : 'block' }}
                    itemLayout="horizontal"
                    bordered={true}
                    dataSource={AllPrescriptionInfo}
                    renderItem={(item, index) => (
                        <List.Item key={item + index}>
                            <a href="/" onClick={this.ShowPrescriptionInfo(index)}>
                                <List.Item.Meta
                                    avatar={<img style={{ width: '45px', height: '45px' }} src={textImg} alt="文本" />}
                                    title={`患者名称：${AllPrescription_PatMes[index].name}`}
                                    description={`预约时间段：${item.bookedTime}`}
                                />
                            </a>
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default AdminWorkList;