import React, { Component } from 'react';
import { Table } from 'antd'
import { POST } from './api/index.jsx'

const columns = [
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '药品数量', dataIndex: 'Num', key: 'Num' },
    { title: '价格', dataIndex: 'Price', key: 'Price' },
];

class ShowMedInfo extends Component {

    state = {
        medInPresList: [],          //这是患者的药物信息列表
        medInfoList: [],             //这是药物信息列表
        dataSource: [],
        TotalPrice: 0
    }

    componentDidMount() {
        POST("/MedicineController/findMedInfoByPresID", { PresID: 6 })
            .then(resp => {
                // console.log(resp.data)
                this.setState({ medInPresList: resp.data.medInPresList, medInfoList: resp.data.medInfoList }, () => {
                    const { medInPresList, medInfoList } = this.state
                    const dataSource = []
                    const Source = []
                    for (let i = 0; i < medInPresList.length; i++) {
                        Source.push({ medInPresInfo: medInPresList[i], medInfo: medInfoList[i] })
                    }
                    let TotalPrice = 0
                    Source.forEach((item, index) => {
                        TotalPrice += item.medInPresInfo.medNum * item.medInfo.price * 1
                        dataSource.push({
                            key: item.medInPresInfo.id,
                            name: item.medInfo.medName,
                            Num: item.medInPresInfo.medNum,
                            Price: item.medInPresInfo.medNum * item.medInfo.price,
                            description: item.medInfo.description,
                        })
                        if (index === Source.length - 1) {
                            this.setState({ TotalPrice })
                        }
                    })

                    this.setState({ dataSource })
                })
            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { dataSource, TotalPrice } = this.state
        console.log("dataSource:  ", dataSource)
        console.log(TotalPrice);
        return (
            <div>
                <Table
                    columns={columns}
                    expandedRowRender={record => <p style={{ margin: 0 }}>{record.description}</p>}
                    dataSource={this.state.dataSource}
                    footer={() => (
                        <span style={{ position: 'relative', left: '75%' }}>{`总价：${TotalPrice}`}</span>
                    )}
                />
            </div>
        );
    }
}

export default ShowMedInfo;