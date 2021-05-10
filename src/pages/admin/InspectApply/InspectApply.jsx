import React, { Component } from 'react';
import { Layout, message, Table, Button, Input, Icon, Modal, Form } from 'antd';
import { GET, POST } from '../../../api/index'
import memoryUtils from '../../../utils/memoryUtils'
import Highlighter from 'react-highlight-words';
import './index.css'

const { Content } = Layout;

class InspectApply extends Component {

    state = {
        DocInfo: memoryUtils.User,
        searchText: '',                       //搜索框中的文本
        searchedColumn: '',                 //被选中的列名
        ApplymentInfo: [],                  //所有申请信息
        Visible: false,
        UpdateInfo: {}
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

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {          //这里的values采用的是{medID:num}这样的对象形式，标识有多少这个药品
            if (!err) {
                const { UpdateInfo, ApplymentInfo } = this.state
                const data = { ...UpdateInfo, managerMes: values.managerMes }
                console.log(data);
                console.log(ApplymentInfo);
                POST('/MedEquApplyController/UpdateApplyment', data)
                    .then(resp => {
                        if (resp.data === 1) {
                            message.success('操作成功')
                            //
                            const newApplymentInfo = []
                            ApplymentInfo.forEach(value => {
                                if (value.ID !== data.ID) {
                                    newApplymentInfo.push(value)
                                }
                            })
                            this.setState({ ApplymentInfo: newApplymentInfo, UpdateInfo: {} })
                        } else {
                            message.error('操作失败')
                        }
                        this.setState({ Visible: false })
                    })
                    .catch(err => message.error(err.message))
            }
        })


    }

    //对申请的操作方法
    OperateApply = (Type, OperateInfo) => {
        return () => {
            const { DocInfo } = this.state
            //申请状态
            let status = -2
            if (Type === 'Ratify') {
                //如果是批准，那么就将状态改为0，即为正在使用中
                status = 0
            } else if (Type === 'UnRatify') {
                //如果是不批准，那么就将状态改为2，并传入原因
                status = -1
            }
            const UpdateInfo = { ID: OperateInfo.ID, managerID: DocInfo.empID, status }
            this.setState({ UpdateInfo, Visible: true })
        }
    }

    componentDidMount() {
        GET('/MedEquApplyController/findUnfinidhedApply')
            .then(resp => {
                console.log(resp.data);
                if (resp.data !== 'Nothing') {
                    const { DocInfoList, EquApplist, EquInfoList } = resp.data
                    const ApplymentInfo = []
                    EquApplist.forEach(value => {
                        ApplymentInfo.push({
                            key: value.id,
                            ID: value.id,
                            ApplyID: value.docID,
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
                            OperateInfo: { ID: value.id },
                            description: value.lendReason
                        })
                    })
                    this.setState({ ApplymentInfo })
                }
            })
            .catch(err => message.error(err.message))
    }
    render() {
        const { ApplymentInfo, Visible } = this.state
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
                        dataIndex: 'ApplyID',
                        key: 'ApplyID',
                        ...this.getColumnSearchProps('ApplyID'),
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
                        <Button type='link' onClick={this.OperateApply('Ratify', OperateInfo)}>批准</Button>
                        <Button type='link' onClick={this.OperateApply('UnRatify', OperateInfo)}>不批准</Button>
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
        const FormDataSource = [
            {
                key: '1',
                FirstCol: '留言',
                SecondCol: (<Form.Item >
                    {getFieldDecorator('managerMes', {
                        rules: [
                            { required: true, message: '请填写留言!' }
                        ],
                        initialValue: '已批准',
                        validateTrigger: 'onBlur'
                    })(<Input.TextArea
                        autoSize={true}
                        placeholder='请输入留言'
                        allowClear={true}
                        style={{ marginBottom: '10px' }}
                    />)}
                </Form.Item>)
            },
            {
                key: '2',
                FirstCol: '',
                SecondCol: (<Button type='primary' htmlType='submit'>确认</Button>)
            }
        ]

        return (
            <div>
                <Content style={{ height: '100%' }}>
                    <div className='InspectApply-Content'>
                        <div className='InspectApply-Content-box'>
                            <Table
                                columns={ApplymentColumns}
                                bordered
                                dataSource={ApplymentInfo}
                                locale={{ emptyText: '暂无任何申请' }}
                                expandedRowRender={record => <p style={{ margin: 0 }}>{`申请理由：${record.description}`}</p>}
                            />

                            <Modal
                                title='申请确认单'
                                visible={Visible}
                                onCancel={() => this.setState({ Visible: false })}
                                keyboard={true}
                                bodyStyle={{ width: '600px' }}
                                width={600}
                                footer={null}
                            >
                                <Form onSubmit={this.handleSubmit} className='InspectApply-Form'>
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
                    </div>
                </Content>
            </div>
        );
    }
}

export default Form.create()(InspectApply);