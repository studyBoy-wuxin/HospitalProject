import React, { Component } from 'react';
import { Transfer, Switch, Table, Tag, InputNumber, Select, Button, Modal, Form, message, Input } from 'antd';
import difference from 'lodash/difference';
import { GET, POST } from '../../../../../api/index.jsx'

const { Option } = Select

class MedSearchHeader extends Component {
    state = {
        targetKeys: [],                 //在右边集合的key
        disabled: false,
        showSearch: true,
        ModalVisible: false,
        AllType: [],                    //获取到所有的药物类型
        MedicinesList: [],            //通过type查找到的药物
        AllMedicinesList: [],
        PresMedicineList: [],
        RightArr: []                 //定义一个数组，每次选项在穿梭到右边时，都放在RightArr中
    };

    onChange = (targetKeys, direction, moveKeys) => {
        // console.log('targetKeys:', targetKeys)
        // console.log('direction:', direction)
        // console.log('moveKeys:', moveKeys)
        const { MedicinesList, RightArr } = this.state

        if (direction === 'right') {
            MedicinesList.forEach((value) => {
                //进入forEach后，进行一个for循环，因为穿梭的元素可以是多个，也就是说moveKeys这个数组里有多个元素
                for (let i = 0; i < MedicinesList.length; i++) {
                    //开始循环，如果forEach的第一个元素满足key值等于moveKeys中的某一个值
                    if (value.key === moveKeys[i]) {
                        RightArr.push(value)
                        //操作完之后记得return，这样可以提高效率，否则forEach的每个元素都要遍历MedicinesList.length遍
                        return
                    }
                }
            })
        } else if (direction === 'left') {              //如果是向左边移动
            /*
             *这个的原理是，循环moveKeys的数组长度遍，因为我只需要删除移动的元素，
             *每一遍中的，找到与移动元素key值相等的元素的索引，最后再删除
            */
            for (let i = 0; i < moveKeys.length; i++) {
                //这里需要找到RightArr中key与移动的moveKeys[i]相等的元素索引,注意的是：moveKeys[i]中的key是RightArr本来就有的
                const spliceIndex = RightArr.findIndex((currentValue) => {      //currentValue就是RightArr中的每一个值
                    return currentValue.key === moveKeys[i]
                })
                //如果找到了，那么就删除该元素
                if (spliceIndex !== -1) {
                    RightArr.splice(spliceIndex, 1)
                }
            }
        }
        console.log(RightArr)
        this.setState({ targetKeys });
    };

    //在componentDidMount这个生命周期中，我们需要发送两侧GET请求，分别是为了获取所有的药物类型以及所有的药品信息
    componentDidMount() {
        //获取所有的药物类型
        GET('/MedicineController/findAllType')
            .then(resp => {
                // console.log(resp.data)
                this.setState({ AllType: resp.data })
            })
            .catch(err => console.log(err.message))

        //获取所有的药品信息
        GET('/MedicineController/findAllMedicines')
            .then(resp => {
                //对传递来的数据进行一定的处理
                const MedicinesList = resp.data.map(value => {
                    delete value.address            //先删除不需要的address属性
                    value.disabled = value.inventory === 0 ? true : false
                    value.Num = value.medID                 //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
                    return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                })
                this.setState({ MedicinesList })
            })
            .catch(err => console.log(err.message))
    }

    //点击类别时展现出来的数据
    onSelected = (value) => {
        //当选择的是全部的时候，发起的是
        if (value === '全部') {
            //获取所有的药品信息
            GET('/MedicineController/findAllMedicines')
                .then(resp => {
                    //对传递来的数据进行一定的处理
                    const MedicinesList = resp.data.map(value => {
                        delete value.address            //先删除不需要的address属性
                        value.disabled = value.inventory === 0 ? true : false
                        value.Num = value.medID                                 //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
                        return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                    })
                    console.log(MedicinesList)
                    this.setState({ MedicinesList })
                })
                .catch(err => console.log(err.message))
        } else {
            POST('/MedicineController/findMedicinesByType', { Type: value })
                .then(resp => {
                    console.log(resp.data)
                    //对传递来的数据进行一定的处理
                    const MedicinesList = resp.data.map(value => {
                        delete value.address            //先删除不需要的address属性
                        value.disabled = value.inventory === 0 ? true : false
                        value.Num = value.medID                         //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
                        return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                    })
                    this.setState({ MedicinesList })
                })
                .catch(err => console.log(err.message))
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        const { RightArr } = this.state
        if (RightArr.length === 0) {
            Modal.warning({
                title: '警告消息',
                content: '目前病历单并无内容，请添加药品后生成病历单！！！',
            });
        } else {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    let PresMedicineList = []
                    let MedListByKey = []
                    //for循环，循环values对象中属性个数
                    for (let i = 0; i < Object.keys(values).length; i++) {
                        RightArr.forEach(item => {
                            if (item.key === Object.keys(values)[i]) {
                                MedListByKey.push(item)
                            }
                        })
                        //Object.keys：遍历属性名，Object.values：遍历属性值
                        PresMedicineList.push({
                            key: MedListByKey[i].key,
                            MedName: MedListByKey[i].medName,
                            MedNum: Object.values(values)[i],
                            price: Object.values(values)[i] * MedListByKey[i].price
                        })
                        if (i === Object.keys(values).length - 1) {
                            let TotalPrice = 0
                            for (let i = 0; i < PresMedicineList.length; i++) {
                                TotalPrice += PresMedicineList[i].price
                            }
                            console.log("TotalPrice:", TotalPrice)
                            PresMedicineList.push({ key: 'TotalPrice', MedName: '', MedNum: '', price: '总价：' + TotalPrice })
                        }
                    }
                    console.log("MedListByKey:", MedListByKey)
                    console.log("PresMedicineList:", PresMedicineList)
                    this.setState({ ModalVisible: true, PresMedicineList })
                }
            });
        }

    };

    onSure = () => {
        message.success("成功！")
    }

    render() {
        const { targetKeys, disabled, showSearch, RightArr } = this.state;
        const { getFieldDecorator } = this.props.form;

        const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => {    //这个restProps指的就是使用TableTransfer标签所传递过来的其他属性
            return (
                <Transfer {...restProps} showSelectAll={false} >
                    {({
                        direction,                          //表示是哪边的框
                        filteredItems,                         //这个是左边或者右边的框中所含有的元素
                        onItemSelectAll,
                        onItemSelect,
                        selectedKeys: listSelectedKeys,             //这个数组中存放的是已经打勾了的数据的key值
                    }) => {
                        const columns = direction === 'left' ? leftColumns : rightColumns;

                        const rowSelection = {
                            //record指的是table中的每一条数据
                            getCheckboxProps: record => ({ disabled: record.disabled }),      //方法返回了一个对象，这个对象的属性就是checkbox中的各个属性
                            //selectedRows:表示的是所有已选择的行的对象所组成的数组
                            onSelectAll(selected, selectedRows) {
                                const treeSelectedKeys = selectedRows.map(({ key }) => key);           //treeSelectedKeys表是存放已选择的数据的key值

                                //已选择的?如果是，那么就在treeSelectedKeys找除listSelectedKeys以外的数据
                                const diffKeys = selected
                                    ? difference(treeSelectedKeys, listSelectedKeys)
                                    : difference(listSelectedKeys, treeSelectedKeys);
                                onItemSelectAll(diffKeys, selected);
                            },
                            //record表示选中的数据对象
                            //selected为true时为选中
                            //selectedRows表示的是所选择的数据对象的数组
                            onSelect(record, selected) {
                                onItemSelect(record.key, selected);
                            },
                            selectedRowKeys: listSelectedKeys,
                        };
                        return (
                            <Table
                                rowSelection={rowSelection}
                                pagination={{
                                    hideOnSinglePage: true,
                                    pageSize: 10,
                                }}
                                columns={columns}
                                /*这里必须判断一遍，如果方向不是左边而是右边的，要使用RightArr数组，
                                 * 这样做的目的是使左右的表格的数据源分离，否则每次更新数据，右侧所选择的都会清空 
                                 *我们需要统计所选择的药物信息，所以必须把右侧的数据源分离出来
                                 */
                                dataSource={direction === 'left' ? filteredItems : RightArr}
                                size="small"
                                footer={direction === 'left' ?
                                    () => (
                                        <Switch
                                            unCheckedChildren="showSearch"
                                            checkedChildren="showSearch"
                                            checked={showSearch}
                                            onChange={() => this.setState({ showSearch: !showSearch })}
                                            style={{ marginTop: 16 }}
                                        />) :
                                    () => (<center><Button type="primary" htmlType="submit">生成病历单</Button></center>)}
                            />
                        );
                    }}
                </Transfer>
            )
        };

        //左边的穿梭框的表格头
        const leftTableColumns = [
            {
                dataIndex: 'medName',
                title: 'medName',
            },
            {
                dataIndex: 'type',
                title: '种类',
                render: tag => <Tag>{tag}</Tag>,
            },
            {
                dataIndex: 'description',
                title: 'Description',
            },
        ];
        //右边的穿梭框的表格头
        const rightTableColumns = [
            {
                dataIndex: 'medName',
                title: '药品名称',
            },
            {
                dataIndex: 'Num',
                title: '数量',
                render: (Num) => (<Form.Item >
                    {getFieldDecorator(Num, {
                        rules: [
                            { required: true, message: '请选择药品量!' }
                        ],
                        initialValue: 1,
                        validateTrigger: 'onBlur'
                    })(<InputNumber
                        min={0}
                        max={20}
                        step={1}
                        onChange={this.changeNum}
                    />)}
                </Form.Item>)
            },
            {
                dataIndex: 'price',
                title: '单价',
                render: price => { return `￥ ${price}` }
            }
        ];

        const columns = [
            {
                title: '药名',
                dataIndex: 'MedName',
                key: 'MedName',
            },
            {
                title: '数量',
                dataIndex: 'MedNum',
                key: 'MedNum',
            },
            {
                title: '价格',
                dataIndex: 'price',
                key: 'price',
            },
        ];

        return (
            <div>
                <div>
                    <Select
                        showSearch
                        style={{ width: '100%', marginBottom: '10px' }}
                        placeholder="Select a person"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onSelect={this.onSelected}
                        dropdownStyle={{ textAlign: 'center' }}         //定义下拉菜单的样式
                        defaultValue='---全部---'
                    >
                        <Option value='全部'>---全部---</Option>
                        {

                            this.state.AllType.map((item, index) => {
                                return <Option key={item + index} value={item}>{item}</Option>
                            })
                        }
                    </Select>
                </div>
                <Form onSubmit={this.handleSubmit}>
                    <TableTransfer
                        dataSource={this.state.MedicinesList}
                        targetKeys={targetKeys}         //显示在右侧框数据的 key 集合
                        disabled={disabled}
                        showSearch={showSearch}
                        onChange={this.onChange}
                        //接收 inputValue option 两个参数，当 option 符合筛选条件时，应返回 true，反之则返回 false
                        //用于搜索
                        filterOption={(inputValue, option) =>
                            option.medName.indexOf(inputValue) !== -1 || option.type.indexOf(inputValue) !== -1
                            // console.log(inputValue, option)
                        }
                        leftColumns={leftTableColumns}
                        rightColumns={rightTableColumns}
                        locale={{ itemUnit: '项', itemsUnit: '项', searchPlaceholder: '请输入搜索内容' }}
                    />
                </Form>

                <Modal
                    title="确认药品信息"
                    visible={this.state.ModalVisible}
                    footer={null}
                    onCancel={() => { this.setState({ ModalVisible: false }) }}
                    keyboard={true}
                    bodyStyle={{ width: '600px' }}
                    width={600}
                >

                    <Table
                        dataSource={this.state.PresMedicineList}
                        columns={columns}
                        showHeader={true}
                        pagination={{
                            hideOnSinglePage: true,
                            pageSize: 10
                        }}
                        footer={() => (
                            <div>
                                <Input.TextArea
                                    autoSize={true}
                                    placeholder='请输入医嘱'
                                    allowClear={true}
                                    style={{ marginBottom: '10px' }}
                                />
                                <center><Button type="primary" onClick={this.onSure}>确定</Button></center>
                            </div>
                        )}
                        bordered
                    />
                </Modal>
            </div>
        );
    }
}

export default Form.create()(MedSearchHeader);