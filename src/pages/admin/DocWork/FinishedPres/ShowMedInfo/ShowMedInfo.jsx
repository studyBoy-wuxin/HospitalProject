import React, { Component } from 'react';
import { Table } from 'antd'
import { POST } from '../../../../../api/index.jsx'
import { connect } from 'react-redux'

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
        const { PresInfo } = this.props
        console.log('props中的PresInfo ------------------------', PresInfo);
        POST("/MedicineController/findMedInfoByPresID", { PresID: PresInfo.PrescriptionInfo.presID })
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
        return (
            <div>
                <Table
                    columns={columns}
                    expandedRowRender={record => <p style={{ margin: 0 }}>{`描述:  ${record.description}`}</p>}
                    dataSource={dataSource}
                    footer={() => (
                        <span style={{ position: 'relative', left: '75%' }}>{`总价：${TotalPrice}`}</span>
                    )}
                />
            </div>
        );
    }
}

export default connect(
    state => ({ PresInfo: state.PresInfo }),
    {}
)(ShowMedInfo);