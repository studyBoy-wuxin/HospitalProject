import React, { Component } from 'react';
import { message, Table, Button, Input, Icon, Divider, Modal, Radio, Form, Upload, InputNumber } from 'antd';
import { GET, POST } from '../../../api/index'
import memoryUtils from '../../../utils/memoryUtils'
import Highlighter from 'react-highlight-words';
import './index.css'

const { Dragger } = Upload;
let URL = ''
class ReturnMedEqu extends Component {

    state = {
        EmpInfo: memoryUtils.User,
        searchText: '',                       //搜索框中的文本
        searchedColumn: '',                 //被选中的列名
        UnReturnApply: [],                  //所有未归还的申请信息
        Visible: false,
        EquStatus: '完好归还',                     //选择设备完好状态的Radio
        UpdateInfo: {},                       //这是需要更新数据库的数据
        SelectApplyInfo: [],                      //点击确认归还后，所存放的信息      
    }

    //dataIndex也就是每一个列名
    getColumnSearchProps = dataIndex => ({
        //自定义筛选菜单
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={node => { this.searchInput = node }}         //回调函数形式的ref
                        placeholder={`Search ${dataIndex}`}         //文字提示
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    {/* 搜索按钮 */}
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Search
                    </Button>
                    {/* 清除过滤器 */}
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </div>
            )
        },
        //filtered表示是否处于过滤状态，如果是，那么就在表头的搜索图标展现出高亮效果
        filterIcon: filtered => (<Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />),

        //value就是搜索框输入的值，record就是每一个数据对象
        //toLowerCase就是把字符串都转换成小写； includes就是是否含有搜索框输入的值
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),

        //搜索时为true，关闭时为false，不知道有啥用
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        //展示一个高亮效果
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}           //高亮与搜索框的文字相同的文字
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                text
            ),
    });

    // 点击确定按钮进行搜索
    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    //清除过滤效果
    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    returnEqu = OperateInfo => {
        return () => {
            const { EmpInfo } = this.state
            //获取到此时申请的时间
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
            const ApplyReturnTime = year + "/" + month + "/" + day + "/  " + hh + ":" + mm;

            const UpdateInfo = { ApplyID: OperateInfo.ID, returnDate: ApplyReturnTime, ReturnID: EmpInfo.empID }
            this.setState({ UpdateInfo, Visible: true, SelectApplyInfo: OperateInfo.ApplyInfo })


        }
    }

    handleSubmit = e => {
        const { UpdateInfo, UnReturnApply } = this.state
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //如果设备‘完好归还’那么就让状态变为1，如果是有损坏那么就2，如果丢失那就-1
                if (values.EquStatus === '完好归还') {
                    values.status = 1
                    values.LossMoney = 0.0
                    values.URL = '无'
                } else if (values.EquStatus === '设备损坏') {
                    values.status = 2
                    values.URL = URL
                } else {
                    values.status = -1
                    values.URL = URL
                }

                delete values.EquStatus
                const data = { ...UpdateInfo, ...values }
                console.log(data);
                POST('/MedEquApplyController/UpdateApplyment', data)
                    .then(resp => {
                        console.log(resp.data);
                        if (resp.data === 1) {
                            message.success('归还成功!')
                            this.props.form.resetFields()           //重置Form所有组件的状态

                            const newApplymentInfo = []
                            UnReturnApply.forEach(value => {
                                if (value.key !== data.ApplyID) {
                                    newApplymentInfo.push(value)
                                }
                            })
                            this.setState({ Visible: false, UnReturnApply: newApplymentInfo })
                        } else {
                            message.error('归还失败')
                        }
                    })
                    .catch(err => message.error(err.message))

            }
        })

    }

    componentDidMount() {
        GET('/MedEquApplyController/findUnReturnApply')
            .then(resp => {
                console.log(resp.data);
                if (resp.data !== 'Nothing') {
                    const { DocInfoList, UnReturnApplyment, EquInfoList } = resp.data
                    const UnReturnApply = []
                    UnReturnApplyment.forEach(value => {
                        UnReturnApply.push({
                            key: value.applyID,
                            ID: value.applyID,
                            ApplyPersonID: value.docID,
                            ApplyName: DocInfoList.map(item => {
                                if (item.docID === value.docID) {
                                    return item.name
                                } else {
                                    return null
                                }
                            }),
                            EqID: value.eqID,
                            EqName: EquInfoList.map(item => {
                                if (item.eqID === value.eqID) {
                                    return item.eqName
                                } else {
                                    return null
                                }
                            }),
                            lendDate: value.lendDate,
                            lendTime: value.lendTimes,
                            OperateInfo: { ID: value.applyID, ApplyInfo: value },
                            description: value.lendReason
                        })
                    })
                    this.setState({ UnReturnApply })
                }
            })
            .catch(err => message.error(err.message))
    }

    render() {
        const { UnReturnApply, Visible, EquStatus, SelectApplyInfo } = this.state
        const { getFieldDecorator } = this.props.form;

        const ApplymentColumns = [
            {
                title: '申请编号',
                dataIndex: 'ID',
                key: 'ID',
                ...this.getColumnSearchProps('ID'),
            },
            {
                title: '申请人',
                children: [
                    {
                        title: '申请人工号',
                        dataIndex: 'ApplyPersonID',
                        key: 'ApplyPersonID',
                        ...this.getColumnSearchProps('ApplyPersonID'),
                    },
                    {
                        title: '申请人姓名',
                        dataIndex: 'ApplyName',
                        key: 'ApplyName',
                        ...this.getColumnSearchProps('ApplyName'),
                    }
                ]
            },
            {
                title: '设备信息',
                children: [
                    {
                        title: '设备编号',
                        dataIndex: 'EqID',
                        key: 'EqID',
                        ...this.getColumnSearchProps('EqID'),
                    },
                    {
                        title: '设备名称',
                        dataIndex: 'EqName',
                        key: 'EqName',
                        ...this.getColumnSearchProps('EqName'),
                    },
                ]
            },
            {
                title: '申请时间',
                dataIndex: 'lendDate',
                key: 'lendDate',
                ...this.getColumnSearchProps('type'),
            },
            {
                title: '申请时长',
                dataIndex: 'lendTime',
                key: 'lendTime',
                ...this.getColumnSearchProps('lendTime'),
            },

            {
                title: '操作',
                dataIndex: 'OperateInfo',
                key: 'OperateInfo',
                render: OperateInfo => (
                    <div>
                        <Button type='link' onClick={this.returnEqu(OperateInfo)}>确认归还</Button>
                    </div>
                )
            }
        ];

        //展示申请确认表的列
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

        const props = {
            name: 'URL',
            multiple: true,
            action: `http://localhost:8888/HospitalProject/MedEquApplyController/upload?EqID=${SelectApplyInfo.eqID}`,
            onChange(info) {
                console.log(info);
                const { status } = info.file;
                if (status === 'done') {
                    message.success(`${info.file.name} 上传成功!`);
                    URL = info.file.response
                } else if (status === 'error') {
                    message.error(`${info.file.name} 上传失败!`);
                }
            },
        };

        const FormDataSource = [
            {
                key: '状态',
                FirstCol: '状态',
                SecondCol: (<Form.Item >
                    {getFieldDecorator('EquStatus', {
                        initialValue: EquStatus,
                    })(<Radio.Group onChange={e => this.setState({ EquStatus: e.target.value })}>
                        <Radio value="完好归还">完好归还</Radio>
                        <Radio value="设备损坏">设备损坏</Radio>
                        <Radio value="设备丢失">设备丢失</Radio>
                    </Radio.Group>)}
                </Form.Item>)
            },
            {
                key: '留言',
                FirstCol: '留言',
                SecondCol: (<Form.Item >
                    {getFieldDecorator('ReturnInfo', {
                        rules: [
                            { required: true, message: '请填写留言!' }
                        ],
                        initialValue: EquStatus,
                    })(<Input.TextArea
                        autoSize={true}
                        placeholder='请输入留言'
                        allowClear={true}
                        style={{ marginBottom: '10px' }}
                    />)}
                </Form.Item>)
            },
            {
                key: '损失金额',
                FirstCol: '损失金额',
                SecondCol: (<Form.Item >
                    {getFieldDecorator('LossMoney', {
                        rules: [
                            { required: true, message: '请填写损失金额!' }
                        ],
                        initialValue: 0,
                    })(<InputNumber
                        step={0.1}
                        className='InputNumber'
                        // style={{ width: '100%', textAlign: 'right' }}
                        formatter={value => ` ${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/元\s?|(,*)/g, '')}
                    />)}
                </Form.Item>)
            },
            {
                key: '上传照片',
                FirstCol: '上传照片',
                SecondCol: (
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                            band files
                        </p>
                    </Dragger>
                )
            },
            {
                key: '提交',
                FirstCol: '',
                SecondCol: (<Button type='primary' htmlType='submit'>确认</Button>)
            }
        ]
        if (EquStatus === '完好归还') {
            FormDataSource.splice(2, 2)
        }

        return (
            <div style={{ width: '90%' }}>
                <div>
                    <span style={{ fontWeight: '700' }}>尚未归还的申请</span>
                </div>
                <Divider />
                <Table
                    style={{ width: '100%' }}
                    columns={ApplymentColumns}
                    bordered
                    dataSource={UnReturnApply}
                    locale={{ emptyText: '暂无未归还的申请' }}
                    expandedRowRender={record => <p style={{ margin: 0 }}>{`申请理由：${record.description}`}</p>}
                />
                <Modal
                    title='归还确认单'
                    visible={Visible}
                    onCancel={() => this.setState({ Visible: false })}
                    keyboard={true}
                    bodyStyle={{ width: '600px' }}
                    width={600}
                    footer={null}
                >
                    <Form onSubmit={this.handleSubmit} className='ReturnMedEqu-Form'>
                        <Table
                            dataSource={FormDataSource}
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

export default Form.create()(ReturnMedEqu);