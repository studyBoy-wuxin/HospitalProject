import React, { Component } from 'react';
import { message, Table, Divider, Icon, Button, Input, Modal, Form } from 'antd';
import Highlighter from 'react-highlight-words';
import { GET, POST } from '../../../api/index'
import './index.css'
import AddComponent from './AddComponent/AddComponent'

const { confirm } = Modal;

class OperateMedEqu extends Component {

    state = {
        MedEquList: [],              //包含全部医疗资源的信息
        isOnSure: false,            //表示是否展示更新时的确定按钮
        SelectedIndex: -1,
        SelectedEqID: '',
        expandedRowKeys: []
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

    delete = EqID => {
        return () => {
            const { MedEquList } = this.state
            confirm({
                title: '你确定要删除该医疗资源吗?',
                cancelText: '取消',
                okText: '确定',
                onOk: () => {
                    POST('/MedEquController/DeleteMedEquByEqID', { EqID })
                        .then(resp => {
                            console.log(resp.data)
                            if (resp.data === 1) {
                                message.success('删除成功!')
                                const newMedEquList = []
                                MedEquList.forEach(value => {
                                    if (value.key !== EqID) {
                                        newMedEquList.push(value)
                                    }
                                })
                                this.setState({ MedEquList: newMedEquList })
                            } else {
                                message.error('删除失败!')
                            }
                        })
                        .catch(err => message.error(err.message))
                },
                okType: 'danger',
                maskClosable: true,
            })
        }
    }

    UpdateHandleSubmit = e => {
        e.preventDefault();
        const { SelectedEqID, MedEquList, SelectedIndex } = this.state
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.key = SelectedEqID
                values.EqID = SelectedEqID
                console.log(values);

                POST('/MedEquController/UpdateMedEqu', { ...values })
                    .then(resp => {
                        console.log(resp.data);
                        if (resp.data === 1) {
                            message.success('更新成功!')
                            const NewMedEquList = []
                            MedEquList.forEach((item, index) => {
                                if (index === SelectedIndex) {
                                    NewMedEquList.push({ ...values, OtherInfo: { EqID: item.EqID, index } })
                                } else {
                                    NewMedEquList.push({
                                        key: item.EqID,
                                        EqID: item.EqID,
                                        EqName: item.EqName,
                                        Type: item.Type,
                                        EqAddress: item.EqAddress,
                                        value: item.value,
                                        OtherInfo: { EqID: item.EqID, index },
                                        EqDescription: item.EqDescription
                                    })
                                }
                            })
                            console.log(NewMedEquList);
                            this.setState({ isOnSure: false, MedEquList: NewMedEquList })
                        } else {
                            message.error('更新失败!')
                        }

                    })
                    .catch(err => message.error(err.message))
            }
        })
    }

    Update = values => {
        return () => {
            const { expandedRowKeys } = this.state
            this.setState({ SelectedIndex: values.index, isOnSure: true, SelectedEqID: values.EqID, expandedRowKeys: [...expandedRowKeys, values.EqID] })
        }
    }

    componentDidMount() {
        GET('/MedEquController/findAllMedEquInfo')
            .then(resp => {
                //包含全部医疗资源的信息
                const MedEquList = []
                resp.data.forEach((item, index) => {
                    MedEquList.push({
                        key: item.eqID,
                        EqID: item.eqID,
                        EqName: item.eqName,
                        Type: item.type,
                        EqAddress: item.eqAddress,
                        value: item.value,
                        OtherInfo: { EqID: item.eqID, index },
                        EqDescription: item.eqDescription
                    })
                })
                this.setState({ MedEquList })
            })
            .catch(err => message.error(err.message))
    }

    render() {

        const { MedEquList, isOnSure, SelectedIndex, SelectedEqID, expandedRowKeys } = this.state
        const { getFieldDecorator } = this.props.form;
        const EquInfocolumns = [
            {
                title: '编号',
                dataIndex: 'EqID',
                key: 'EqID',
                ...this.getColumnSearchProps('EqID'),
            },
            {
                title: '名称',
                dataIndex: 'EqName',
                key: 'EqName',
                ...this.getColumnSearchProps('EqName'),
            },
            {
                title: '类型',
                dataIndex: 'Type',
                key: 'Type',
                ...this.getColumnSearchProps('Type'),
            },
            {
                title: '地址',
                dataIndex: 'EqAddress',
                key: 'EqAddress',
                ...this.getColumnSearchProps('EqAddress'),

            },
            {
                title: '价值',
                dataIndex: 'value',
                key: 'value',
                ...this.getColumnSearchProps('value'),
                render: value => isOnSure ? value : `${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            },
            {
                title: '操作',
                dataIndex: 'OtherInfo',
                key: 'OtherInfo',
                render: (value, _, index) => (
                    <div>
                        {index === SelectedIndex ?
                            (<span>
                                <Button style={{ display: isOnSure ? 'inline' : 'none' }} type='link' htmlType='submit'>确定</Button>
                                <Button style={{ display: isOnSure ? 'none' : 'inline' }} type='link' onClick={this.Update(value)}>修改</Button>
                            </span>)
                            : <Button type='link' onClick={this.Update(value)}>修改</Button>}

                        <Button type='link' onClick={this.delete(value.EqID)}>删除</Button>
                    </div>
                )
            }
        ];

        const NewMedEquList = []
        if (isOnSure === true) {
            MedEquList.forEach((item, index) => {
                if (SelectedIndex === index) {
                    NewMedEquList.push({
                        key: item.EqID,
                        EqID: item.EqID,
                        EqName: (<Form.Item hasFeedback>
                            {getFieldDecorator('EqName', {
                                rules: [{ required: true, message: '请输入名称!' }],
                                initialValue: item.EqName
                            })(<Input placeholder="请输入名称" />)}
                        </Form.Item>),

                        Type: (<Form.Item hasFeedback>
                            {getFieldDecorator('Type', {
                                rules: [{ required: true, message: '请输入类型!' }],
                                initialValue: item.Type
                            })(<Input placeholder="请输入类型" />)}
                        </Form.Item>),

                        EqAddress: (<Form.Item hasFeedback>
                            {getFieldDecorator('EqAddress', {
                                rules: [{ required: true, message: '请输入存放地址!' }],
                                initialValue: item.EqAddress
                            })(<Input placeholder="请输入存放地址" />)}
                        </Form.Item>),

                        value: (<Form.Item hasFeedback>
                            {getFieldDecorator('value', {
                                rules: [{ required: true, message: '请输入价值!' },
                                { pattern: /^[0-9]{1,8}$/, message: '请输入1-8位数字！' }],
                                initialValue: item.value
                            })(<Input placeholder="请输入价值" />)}
                        </Form.Item>),

                        OtherInfo: { EqID: item.EqID, index },

                        EqDescription: (<Form.Item>
                            {getFieldDecorator('EqDescription', {
                                rules: [{ required: true, message: '请输入描述!' }],
                                initialValue: item.EqDescription
                            })(<Input.TextArea
                                allowClear={true}
                                autoSize={true}
                                style={{ width: '80%' }}
                            />)}
                        </Form.Item>),
                    })
                } else {
                    NewMedEquList.push({
                        key: item.EqID,
                        EqID: item.EqID,
                        EqName: item.EqName,
                        Type: item.Type,
                        EqAddress: item.EqAddress,
                        value: item.value,
                        OtherInfo: { EqID: item.EqID, index },
                        EqDescription: item.EqDescription
                    })
                }
            })
        }
        console.log(SelectedEqID);
        return (
            <div className='OperateMedEqu-Div' style={{ width: '90%' }}>
                <div>
                    <span style={{ fontWeight: '700' }}>管理医疗资源</span>
                </div>
                <Divider />
                <AddComponent />
                <Form onSubmit={this.UpdateHandleSubmit} className='OperateMedEqu-UpdateForm'>
                    <Table
                        rowKey={record => record.EqID}
                        style={{ width: '100%' }}
                        columns={EquInfocolumns}
                        bordered
                        pagination={{ hideOnSinglePage: true }}
                        dataSource={isOnSure ? NewMedEquList : MedEquList}
                        locale={{ emptyText: '暂无任何医疗资源' }}
                        expandedRowRender={record => <div className='expandedRow' >简介：{record.EqDescription}</div>}
                        /* onExpand就是点击展开图标时触发的操作，因为设置了expandedRowKeys属性，所以点击展开图标并没有反应，所以我们
                        想到了个办法：把expandedRowKeys的值受state的控制，然后通过点击展开运算符，动态地修改state里的值，以数据为驱动*/
                        expandedRowKeys={this.state.expandedRowKeys}
                        onExpand={(expanded, record) => {
                            console.log(expanded, record);
                            if (expanded) {
                                this.setState({
                                    expandedRowKeys: [...expandedRowKeys, record.key]
                                })
                            } else {
                                const index = expandedRowKeys.findIndex(e => e === record.key)
                                const newArray = [...expandedRowKeys]
                                newArray.splice(index, 1)
                                this.setState({
                                    expandedRowKeys: newArray
                                })
                            }
                        }}
                    />
                </Form>
            </div>
        );
    }
}

export default Form.create()(OperateMedEqu);