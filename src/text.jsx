import React, { Component } from 'react';
import { Table, Tooltip, Icon } from 'antd';
import { POST } from './api/index.jsx'

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

class PayForCost extends Component {

    state = {
        data: []
    }

    componentDidMount() {
        POST('/PatientController/findCostById', { type: 'patient', PatID: 10001 })
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
                data.push({
                    key: 3,
                    Name: '',
                    Num: '',
                    Price: `总价：￥ ${resp.data.presInfo.totalPrice + resp.data.docWorkInfo.price}`,
                })
                this.setState({ data })

            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { data } = this.state
        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={data}
                    bordered
                    pagination={false}
                />,
            </div>
        );
    }
}

export default PayForCost;