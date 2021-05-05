import { PageHeader, Tag, Typography, Row, Table, Button, Modal, Form, message } from 'antd';
import React, { Component } from 'react';
import {
    StarOutlined,
    StarFilled
} from '@ant-design/icons'
import './index.css'
import { withRouter } from 'react-router-dom'
import { POST } from '../../../../api/index.jsx'
// import PubSub from 'pubsub-js'
import memoryUtils from '../../../../utils/memoryUtils'
import { connect } from 'react-redux'
import { ChangeKeyAction } from '../../../../redux/action/PageKeyAction'
import { ChangeDocInfoAction } from '../../../../redux/action/DocInfoAction'

const { Paragraph } = Typography;

class DocInfo extends Component {

    state = {
        StarStatus: false,
        SelectedDocInfo: [],
        workInfo: [],
        Visible: false,
        FormDataSource: [],
        Patient: memoryUtils.User
    }

    //点击预约
    onBook = (index, DocInfoID) => {
        return () => {
            const { Patient, workInfo } = this.state
            console.log(workInfo[index].Time)
            const data = { DocInfoID, PatID: Patient.patID, BookedTime: workInfo[index].Time }
            console.log(data);
            POST('/DocInfoController/updateTreatMes', data)
                .then(resp => {
                    if (resp.data === '预约成功') {
                        message.success(resp.data)
                        this.setState({ Visible: false })
                        //在预约成功后，重新调用componentDidMount方法，更新数据
                        this.componentDidMount()
                    } else if (resp.data === 'UnPass') {
                        message.error('您有尚未支付完成的订单，请先支付完成后再挂号!')
                        console.log(this.props);
                        this.props.history.push('/userPage/OfficialServer/PayForCost')
                    } else {
                        message.error("预约失败")
                    }
                })
                .catch(err => console.log(err.message))
        }
    }

    //确认预约信息
    ConfirmInfo = (DocInfoID, index) => {
        return () => {
            const { workInfo, Patient } = this.state
            const {
                branchSubject,
                name,
                position } = this.state.SelectedDocInfo
            //预约信息
            const FormDataSource = [
                {
                    key: '1',
                    FirstCol: '就诊人姓名',
                    SecondCol: Patient.name
                },
                {
                    key: '2',
                    FirstCol: '医生姓名',
                    SecondCol: name
                },
                {
                    key: '3',
                    FirstCol: '医生职称',
                    SecondCol: position
                },
                {
                    key: '4',
                    FirstCol: '科室',
                    SecondCol: branchSubject
                },
                {
                    key: '5',
                    FirstCol: '就诊时间',
                    SecondCol: workInfo[index].Time
                },
                {
                    key: '6',
                    FirstCol: '挂号金额',
                    SecondCol: workInfo[index].Price
                },
                {
                    key: '7',
                    FirstCol: '预约',
                    SecondCol: (
                        <Button type="primary" htmlType="submit" onClick={this.onBook(index, DocInfoID)}>
                            确认预约
                        </Button>
                    )
                },
            ]
            this.setState({ Visible: true, FormDataSource })
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.SelectedDocInfo.docID !== prevState.SelectedDocInfo.docID) {
            return {
                SelectedDocInfo: nextProps.SelectedDocInfo,
            };
        }
        return null;
    }

    //发送post请求，获取到该医生的时间信息
    componentDidMount() {
        //获取到由SearchSubject传递过来的值

        this.setState({ SelectedDocInfo: this.state.SelectedDocInfo }, () => {

            const { docID } = this.state.SelectedDocInfo
            //定义一个数组，把POST请求获取来的医生工作信息按规律放入
            const mes = []
            POST('/DocInfoController/findAllInfoByDocID', { docId: docID })
                .then(resp => {
                    console.log(resp.data);
                    resp.data.forEach((value, index) => {
                        value.treatBegin = value.treatBegin.substring(0, 5)
                        value.treatEnd = value.treatEnd.substring(0, 5)
                        mes.push({
                            key: value.docInfoID + index,
                            Date: value.treatDate,
                            Time: value.treatBegin + '-' + value.treatEnd,
                            Price: '￥' + value.price,
                            TreatNum: value.treatNum,
                            book: value.treatNum === 0 ?
                                '已满诊' :
                                <Button type='primary' onClick={this.ConfirmInfo(value.docInfoID, index)}>预约</Button>
                        })
                    })
                    this.setState({
                        workInfo: mes
                    })
                })
                .catch(err => console.log(err.message))
        })
    }

    //在每次销毁DocInfo这个组件的时候，都要调用一下父组件SearchSubject中初始化state的方法
    componentWillUnmount() {
        console.log("willummount---------------")
        this.props.clearSelectedDocInfoInState()
        this.props.ChangeKey(0)
        this.props.changerDocInfo([])
    }

    render() {

        const {
            branchSubject,
            introduce,
            name,
            position,
            qualification } = this.state.SelectedDocInfo


        const content = (
            <div className="content">
                <Paragraph>
                    擅长： {branchSubject}问题
                </Paragraph>
                <Paragraph>
                    介绍： {position} ， {qualification} ， {introduce}
                </Paragraph>
            </div>
        );

        const Content = ({ children, extraContent }) => {
            return (
                <Row className="content" type="flex">
                    <div className="main" style={{ flex: 1 }}>
                        {children}
                    </div>
                    <div
                        className="extra"
                        style={{ marginLeft: 80 }}
                    >
                        {extraContent}
                    </div>
                </Row>
            );
        };

        const WorkInfocolumns = [
            {
                title: '日期',
                dataIndex: 'Date',
                key: 'Date',
                align: 'center'
            },
            {
                title: '时间',
                dataIndex: 'Time',
                key: 'Time',
                align: 'center'
            },
            {
                title: '诊费',
                dataIndex: 'Price',
                key: 'Price',
                align: 'center'
            },
            {
                title: '预约名额',
                dataIndex: 'TreatNum',
                key: 'TreatNum',
                align: 'center'
            },
            {
                title: '预约',
                dataIndex: 'book',
                key: 'book',
                align: 'center'
            }
        ]

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
            <div className='InfoBox'>
                <div className='docIntroduce'>
                    <PageHeader
                        onBack={() => this.props.ChangeKey(0)}
                        title={name}
                        style={{ border: '1px solid rgb(235, 237, 240)', }}
                        tags={<Tag color="blue">{position}</Tag>}
                        extra={[
                            <div style={{ fontSize: '18px' }} onClick={() => this.setState({ StarStatus: !this.state.StarStatus })} key='a'>
                                {this.state.StarStatus === true ? <StarFilled /> : <StarOutlined />}
                                {this.state.StarStatus === true ? '已' : '未'}收藏
                            </div>
                        ]}
                        avatar={{ src: 'https://avatars1.githubusercontent.com/u/8186664?s=460&v=4' }}

                    >
                        <Content children={content} />
                    </PageHeader>
                </div>

                <div className='TimePick'>
                    <Table
                        pagination={false}          //取消分页
                        columns={WorkInfocolumns}
                        dataSource={this.state.workInfo}
                    />
                </div>

                <Modal
                    title="挂号确认"
                    visible={this.state.Visible}
                    footer={null}
                    onCancel={() => { this.setState({ Visible: false }) }}
                    keyboard={true}
                    bodyStyle={{ width: '600px' }}
                    width={600}
                >
                    <Form onSubmit={this.handleSubmit} className='OwnerMessage-Form'>
                        <Table
                            dataSource={this.state.FormDataSource}
                            columns={columns}
                            showHeader={false}
                            pagination={false}
                            bordered
                        />
                    </Form>
                </Modal>

            </div>
        );
    }
}

export default connect(
    state => ({ DocInfo: state.DocInfo }),
    {
        ChangeKey: ChangeKeyAction,
        changerDocInfo: ChangeDocInfoAction
    }
)(withRouter(DocInfo));