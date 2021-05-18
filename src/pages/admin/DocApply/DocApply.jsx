import React, { Component } from 'react';
import { Layout, message, Table, Button, Icon, Input, Modal, Form, DatePicker, Select } from 'antd';
import { GET, POST } from '../../../api/index.jsx'
import Highlighter from 'react-highlight-words';
import memoryUtils from '../../../utils/memoryUtils'
import './DocApply.css'
import moment from 'moment';

const { Content } = Layout;
const { Option } = Select;

class DocApply extends Component {

    state = {
        DocInfo: memoryUtils.User,
        MedEquInfoList: [],
        searchText: '',                       //搜索框中的文本
        searchedColumn: '',                 //被选中的列名
        Visible: false,
        SelectedEquInfo: [],                //点击申请之后，存放的设备信息，用于展示
        ApplyBeginTime: '',                 //申请起始时间
        AfterValue: '天',
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

    //点击申请时触发的方法
    ApplyByID = value => {
        return () => {
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
            const ApplyBeginTime = year + "/" + month + "/" + day + "/  " + hh + ":" + mm;

            this.setState({ Visible: true, SelectedEquInfo: value, ApplyBeginTime })
        }
    }

    //用于表单数据获取以及表单提交
    handleSubmit = e => {
        e.preventDefault()

        const { DocInfo, SelectedEquInfo, ApplyBeginTime, AfterValue } = this.state
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values, SelectedEquInfo);
                const data = {
                    DocID: DocInfo.empID,
                    EqID: SelectedEquInfo.eqID,
                    lendDate: ApplyBeginTime,
                    LendTimes: `${values.lendTime}${AfterValue}`,
                    LendReason: values.LendReason
                }
                console.log(data);
                POST('/MedEquApplyController/insertApplyment', data)
                    .then(resp => {
                        message.success(resp.data)
                        this.props.form.resetFields()           //重置Form所有组件的状态
                        this.setState({ Visible: false })
                    })
                    .catch(err => message.error(err.message))
            }
        })
    }

    //获取到所有医疗资源的信息
    componentDidMount() {
        GET('/MedEquController/findAllMedEquInfo')
            .then(resp => {
                const MedEquInfoList = []
                resp.data.forEach((value) => {
                    MedEquInfoList.push({
                        key: value.eqID,
                        EqID: value.eqID,
                        name: value.eqName,
                        type: value.type,
                        address: value.eqAddress,
                        description: value.eqDescription,
                        applyID: value
                    })
                })
                this.setState({ MedEquInfoList })
            })
            .catch(err => message.error(err.message))
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { MedEquInfoList, SelectedEquInfo, DocInfo, ApplyBeginTime } = this.state
        const EquInfocolumns = [
            {
                title: '编号',
                dataIndex: 'EqID',
                key: 'EqID',
                ...this.getColumnSearchProps('EqID'),
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                ...this.getColumnSearchProps('name'),
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                ...this.getColumnSearchProps('type'),
            },
            {
                title: '地址',
                dataIndex: 'address',
                key: 'address',
                ...this.getColumnSearchProps('address'),
            },
            {
                title: '操作',
                dataIndex: 'applyID',
                key: 'applyID',
                render: value => <Button type='link' onClick={this.ApplyByID(value)}>申请</Button>
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

        const ApplyInfoData = [
            {
                key: 'ID',
                FirstCol: '申请人工号',
                SecondCol: DocInfo.empID
            },
            {
                key: 'DocName',
                FirstCol: '申请人姓名',
                SecondCol: DocInfo.name
            },
            {
                key: 'EqID',
                FirstCol: '申请设备编号',
                SecondCol: SelectedEquInfo.eqID
            },
            {
                key: 'eqName',
                FirstCol: '申请设备名称',
                SecondCol: SelectedEquInfo.eqName
            },
            {
                key: 'Eqtype',
                FirstCol: '设备类型',
                SecondCol: SelectedEquInfo.type
            },
            {
                key: 'eqDescription',
                FirstCol: '设备简介',
                SecondCol: SelectedEquInfo.eqDescription
            },
            {
                key: 'lendDate',
                FirstCol: '起始时间',
                SecondCol: (
                    <Form.Item>
                        {getFieldDecorator('lendDate', {
                            rules: [{ required: true, message: '请选择申请时间!' }],
                            initialValue: moment(ApplyBeginTime, 'YYYY-MM-DD hh:mm:ss')
                        })(<DatePicker
                            onChange={(_, dateString) => this.setState({ ApplyBeginTime: dateString })}        //获取时间
                            format='YYYY-MM-DD HH:mm:ss'
                            showTime
                            style={{ width: '250px' }}
                        />)}
                    </Form.Item>
                )
            },
            {
                key: 'lendTime',
                FirstCol: '预计使用时间',
                SecondCol: (
                    <Form.Item>
                        {getFieldDecorator('lendTime', {
                            rules: [{ required: true, message: '请选择申请时长!' },
                            { pattern: /^[0-9]{1,3}$/, message: '请输入1~3位数字！' }],
                            initialValue: 1
                        })(
                            <Input
                                addonAfter={(
                                    <Select
                                        defaultValue="天"
                                        showArrow={false}
                                        style={{ width: 40 }}
                                        onChange={value => { this.setState({ AfterValue: value }) }}
                                    >
                                        <Option key='天' value="天"> 天</Option>
                                        <Option key='时' value="时">时</Option>
                                        <Option key='分' value="分">分</Option>
                                    </Select>)}
                            />
                        )}
                    </Form.Item>
                )
            },
            {
                key: 'LendReason',
                FirstCol: '申请理由',
                SecondCol: (
                    <Form.Item >
                        {getFieldDecorator('LendReason', {
                            rules: [
                                { required: true, message: '请填写申请理由!' }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input.TextArea
                            autoSize={true}
                            placeholder='请输入申请理由'
                            allowClear={true}
                            style={{ marginBottom: '10px' }}
                        />)}
                    </Form.Item>
                )
            },
            {
                key: 'ApplyBtn',
                FirstCol: '申请',
                SecondCol: <Button type='primary' htmlType='submit'>确认申请</Button>
            }
        ]
        return (
            <div>
                <Content style={{ height: '100%' }}>
                    <div className='DocApply-Content'>
                        <div className='DocApply-Content-box'>
                            {/* 展示区 */}
                            <div style={{ marginTop: '10px' }}>
                                <Table
                                    columns={EquInfocolumns}
                                    bordered
                                    expandedRowRender={record => <p style={{ margin: 0 }}>{record.description}</p>}
                                    dataSource={MedEquInfoList}
                                />

                                <Modal
                                    title='申请确认单'
                                    visible={this.state.Visible}
                                    onCancel={() => this.setState({ Visible: false })}
                                    keyboard={true}
                                    bodyStyle={{ width: '600px' }}
                                    width={600}
                                    footer={null}
                                >
                                    <Form className='DocApply-Content-Form' onSubmit={this.handleSubmit}>
                                        <Table
                                            dataSource={ApplyInfoData}
                                            columns={columns}
                                            showHeader={false}
                                            pagination={false}
                                            bordered
                                        />
                                    </Form>
                                </Modal>
                            </div>
                        </div>
                    </div>
                </Content>
            </div>
        );
    }
}

export default Form.create()(DocApply);