import React, { Component } from 'react';
import { Transfer, Switch, Table, Tag, InputNumber, Select } from 'antd';
import difference from 'lodash/difference';
import { GET, POST } from './api/index.jsx'

const { Option } = Select

//定义一个数组，每次选项在穿梭到右边时，都放在RightArr中
const RightArr = []

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
                // console.log('listDisabled:', listDisabled)
                const columns = direction === 'left' ? leftColumns : rightColumns;

                const rowSelection = {
                    //record指的是table中的每一条数据
                    getCheckboxProps: record => ({ disabled: record.disabled }),      //方法返回了一个对象，这个对象的属性就是checkbox中的各个属性

                    //selectedRows:表示的是所有已选择的行的对象所组成的数组
                    onSelectAll(selected, selectedRows) {
                        const treeSelectedKeys = selectedRows.map(({ key }) => key);           //treeSelectedKeys表是存放已选择的数据的key值

                        console.log("treeSelectedKeys:", treeSelectedKeys)

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
                        columns={columns}
                        /*这里必须判断一遍，如果方向不是左边而是右边的，要使用RightArr数组，
                         * 这样做的目的是使左右的表格的数据源分离，否则每次更新数据，右侧所选择的都会清空 
                         *我们需要统计所选择的药物信息，所以必须把右侧的数据源分离出来
                         */
                        dataSource={direction === 'left' ? filteredItems : RightArr}
                        // dataSource={filteredItems}
                        size="small"
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
        title: 'medName',
    },
    {
        dataIndex: 'Num',
        title: '数量',
        render: () => <InputNumber
            defaultValue={1}
            min={0}
            max={20}
            step={0.5}
        />
    },
    {
        dataIndex: 'price',
        title: '价格',
        render: price => { return `￥ ${price}` }
    }
];

class text extends Component {
    state = {
        targetKeys: [],                 //在右边集合的key
        disabled: false,
        showSearch: true,
        AllType: [],                    //获取到所有的药物类型
        MedicinesList: [],            //通过type查找到的药物
        AllMedicinesList: []
    };

    onChange = (targetKeys, direction, moveKeys) => {
        // console.log('targetKeys:', targetKeys)
        // console.log('direction:', direction)
        // console.log('moveKeys:', moveKeys)
        const { MedicinesList } = this.state

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
        } else if (direction === 'left') {

            const length = RightArr.length
            for (let i = 0; i < length; i++) {
                console.log(i)
                //currentValue就是RightArr中的每一个值
                //这里需要找到RightArr中key与移动的moveKeys[i]相等的元素索引
                const spliceIndex = RightArr.findIndex((currentValue) => {
                    console.log(i, currentValue)
                    return currentValue.key === moveKeys[i]
                })
                console.log(spliceIndex)
                if (spliceIndex !== -1) {
                    console.log('已删除')
                    RightArr.splice(spliceIndex, 1)
                }
            }
        }


        console.log(RightArr)
        this.setState({ targetKeys });
    };

    triggerShowSearch = showSearch => {
        this.setState({ showSearch });
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
                    return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                })
                console.log(MedicinesList)
                this.setState({ MedicinesList })
            })
            .catch(err => console.log(err.message))
    }

    onSelected = (value) => {
        POST('/MedicineController/findMedicinesByType', { Type: value })
            .then(resp => {
                console.log(resp.data)
                //对传递来的数据进行一定的处理
                const MedicinesList = resp.data.map(value => {
                    delete value.address            //先删除不需要的address属性
                    return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                })
                this.setState({ MedicinesList })
            })
            .catch(err => console.log(err.message))
    }

    render() {
        const { targetKeys, disabled, showSearch } = this.state;
        return (
            <div>
                <div>
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select a person"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onSelect={this.onSelected}
                    >
                        {
                            this.state.AllType.map((item, index) => {
                                return <Option key={item + index} value={item}>{item}</Option>
                            })
                        }
                    </Select>
                </div>
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
                <Switch
                    unCheckedChildren="showSearch"
                    checkedChildren="showSearch"
                    checked={showSearch}
                    onChange={this.triggerShowSearch}
                    style={{ marginTop: 16 }}
                />
            </div>
        );
    }
}

export default text;