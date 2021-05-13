import React, { Component } from 'react';
import { Layout, Divider, message, Modal, Table, Button, Input, Icon } from 'antd';
import { POST } from '../../../api/index.jsx'
import memoryUtils from '../../../utils/memoryUtils'
import Highlighter from 'react-highlight-words';
import './CheckDocApply.css'

const { Content } = Layout;

class CheckDocApply extends Component {

    state = {
        DocInfo: memoryUtils.User,
        EquListByDocID: [],
        Visible: false,
        SelectedApp: [],
        searchText: '',                       //搜索框中的文本
        searchedColumn: '',                 //被选中的列名
        AllEquInfoList: [],                    // 被申请过的全部设备信息
        ManagerList: [],                       //经办人信息
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

    checkSelectedApp = data => {
        return e => {
            e.preventDefault()
            const { DocInfo, ManagerList } = this.state
            const SelectedApp = [
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
                    SecondCol: data.eqID
                },
                {
                    key: 'EqName',
                    FirstCol: '申请设备名称',
                    SecondCol: data.EqName
                },
                {
                    key: 'lendDate',
                    FirstCol: '申请时间',
                    SecondCol: data.lendDate
                },
                {
                    key: 'lendTimes',
                    FirstCol: '申请使用时长',
                    SecondCol: data.lendTimes
                },
                data.status === null ? {
                    key: 'eqDescription',
                    FirstCol: '状态',
                    SecondCol: '申请中'
                } : data.status === 1 ?
                    {
                        key: 'eqDescription',
                        FirstCol: '状态',
                        SecondCol: '已归还'
                    } :
                    {
                        key: 'eqDescription',
                        FirstCol: '状态',
                        SecondCol: '使用中'
                    },
                data.managerID === null ? {} : {
                    key: 'managerID',
                    FirstCol: '经办人',
                    SecondCol: ManagerList.map((value) => {
                        if (value.docID === data.managerID) {
                            return `${value.branchSubject}科：${value.name}${value.position}`
                        } else {
                            return null
                        }
                    })
                },
            ]
            if (data.managerID === null) {
                SelectedApp.splice(SelectedApp.length - 1, 1)
            }
            this.setState({ SelectedApp, Visible: true })
        }
    }

    componentDidMount() {
        const { DocInfo, } = this.state
        POST('/MedEquApplyController/findEquByDocID', { DocID: DocInfo.empID })
            .then(resp => {
                if (resp.data !== 'Nothing') {
                    const EquListByDocID = []
                    resp.data.EquApplist.forEach((value, index) => {
                        EquListByDocID.push({
                            key: value.applyID,
                            ID: value.applyID,
                            EqName: resp.data.EquInfoList[index].eqName,
                            lendDate: value.lendDate,
                            status: value.status === null ? '申请中' : value.status === 0 ? '使用中' : value.status === 1 ? '已归还' : value.status === 2 ? '已归还,设备损坏' : value.status === -1 ? '设备丢失' : '',
                            applyID: { ...value, EqName: resp.data.EquInfoList[index].eqName }
                        })
                    })
                    this.setState({ EquListByDocID, EquInfoList: resp.data.EquInfoList, ManagerList: resp.data.ManagerList })
                }
            })
            .catch(err => message.error(err.message))

    }


    render() {
        const { EquListByDocID, Visible, SelectedApp } = this.state

        const EquInfocolumns = [
            {
                title: '申请编号',
                dataIndex: 'ID',
                key: 'ID',
                ...this.getColumnSearchProps('ID'),
            },
            {
                title: '设备名称',
                dataIndex: 'EqName',
                key: 'EqName',
                ...this.getColumnSearchProps('EqName'),
            },
            {
                title: '申请时间',
                dataIndex: 'lendDate',
                key: 'lendDate',
                ...this.getColumnSearchProps('type'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                ...this.getColumnSearchProps('status'),
            },
            {
                title: '操作',
                dataIndex: 'applyID',
                key: 'applyID',
                render: value => (
                    <div>
                        <Button type='link' onClick={this.checkSelectedApp(value)}>查看</Button>
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
        return (
            <div>
                <Content style={{ height: '100%' }}>
                    <div className='CheckDocApply-Content'>
                        <div className='CheckDocApply-Content-box'>
                            <div>
                                <span style={{ fontWeight: '700' }}>个人申请</span>
                            </div>
                            <Divider />
                            <Table
                                columns={EquInfocolumns}
                                bordered
                                dataSource={EquListByDocID}
                                locale={{ emptyText: '暂无个人申请' }}
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
                                <Table
                                    dataSource={SelectedApp}
                                    columns={columns}
                                    showHeader={false}
                                    pagination={false}
                                    bordered
                                />
                            </Modal>
                        </div>
                    </div>
                </Content>
            </div>
        );
    }
}

export default CheckDocApply;