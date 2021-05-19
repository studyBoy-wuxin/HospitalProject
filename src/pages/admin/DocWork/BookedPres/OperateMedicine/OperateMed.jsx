import React, { Component } from 'react';
import { Transfer, Switch, Table, Tag, InputNumber, Select, Button, Modal, Form, message, Input } from 'antd';
import difference from 'lodash/difference';
import { GET, POST } from '../../../../../api/index.jsx'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import './index.css'

const { Option } = Select

class MedSearchHeader extends Component {
    state = {
        targetKeys: [],                 //在右边集合的key
        disabled: false,
        showSearch: true,
        ModalVisible: false,
        AllType: [],                    //获取到所有的药物类型
        MedicinesList: [],            //通过type查找到的药物
        AllMedicinesList: [],           //所有的药物列表
        PresMedicineList: [],              //处方单中的药物列表
        RightArr: [],                //定义一个数组，每次选项在穿梭到右边时，都放在RightArr中
        PresInfo: {},
        TotalPrice: -1
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        //当props改变即Reducer中的数据改变的时候，就重新赋值
        if (nextProps.PresInfo !== prevState.PresInfo) {
            return {
                PresInfo: nextProps.PresInfo.PrescriptionInfo,
            }
        }
        return null;
    }

    //穿梭框数据改变的回调
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
                    value.Num = { ID: value.medID, max: value.inventory }                //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
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
                        value.Num = { ID: value.medID, max: value.inventory }                                //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
                        return JSON.parse(JSON.stringify(value).replace(/medID/g, 'key'))       //然后把属性中的medID这个属性名改成key
                    })


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
                        value.Num = { ID: value.medID, max: value.inventory }                         //将medID作为属性名，后续药品量作为属性值，然后使用对象的方法取出
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
            this.props.form.validateFieldsAndScroll((err, values) => {          //这里的values采用的是{medID:num}这样的对象形式，标识有多少这个药品
                if (!err) {
                    console.log("handleSubmit----values---:", values)
                    let PresMedicineList = []
                    let MedListByKey = []                               //这个是根据key也就是medID找到的药品列表
                    //for循环，循环values对象中属性个数
                    delete values.DocSuggestion                     //除了删除我还想到的是可以在if结束时，清空value
                    console.log("handleSubmit----values---after:", values)
                    for (let i = 0; i < Object.keys(values).length; i++) {      //Object.keys(values)就是获取到values中所有属性名的数组
                        //这个时候，遍历右边数组，取出key与values中的medID相同的药品元素，存放到MedListByKey中
                        RightArr.forEach(item => {
                            if (item.key === Object.keys(values)[i]) {
                                MedListByKey.push(item)
                            }
                        })
                        //Object.keys：遍历属性名，Object.values：遍历属性值
                        //这时候，整理出病历单中存在的药品信息
                        PresMedicineList.push({
                            key: MedListByKey[i].key,
                            MedName: MedListByKey[i].medName,
                            MedNum: Object.values(values)[i],
                            price: Object.values(values)[i] * MedListByKey[i].price
                        })
                        //在遍历达到最后一次循环的时候，计算出总价
                        if (i === Object.keys(values).length - 1) {
                            let TotalPrice = 0
                            for (let i = 0; i < PresMedicineList.length; i++) {
                                TotalPrice += PresMedicineList[i].price
                            }
                            //再把总价添加到PresMedicineList中，因为这个数组是用来渲染数据的，加上后可以展示总价即可
                            PresMedicineList.push({ key: 'TotalPrice', MedName: '', MedNum: '', price: '总价：' + TotalPrice })
                            this.setState({ TotalPrice })
                        }
                    }
                    this.setState({ ModalVisible: true, PresMedicineList })
                }
            });
        }

    };

    //onSure就是确定药品信息无误了
    onSure = e => {
        e.preventDefault();
        const { PresMedicineList, PresInfo, TotalPrice, RightArr } = this.state

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //需要提交的存放在病历单中的药品信息  (需要存到数据库的数据)
                const MedList = PresMedicineList.map((item) => {
                    return { PresID: parseInt(PresInfo.presID), MedID: item.key, MedNum: parseInt(item.MedNum) }
                })
                //因为在handleSubmit方法中的PresMedicineList的最后一个对象元素，是为了存放总价并进行渲染的，所以MedList接收后需要删除最后一个元素
                MedList.splice(MedList.length - 1, 1)
                //需要提交的病历单信息  (也就是需要更新的病历单信息：医生建议，治疗时间，总价)
                const PresMes = {
                    PresID: PresInfo.presID,
                    DoctorSuggestion: values.DocSuggestion,
                    TreatmentTime: this.props.TreatTime,
                    TotalPrice
                }
                console.log(MedList);
                axios({
                    method: 'POST',
                    url: 'http://localhost:8888/HospitalProject/MedInPrescriptionController/insert',
                    params: PresMes,
                    data: [...MedList],
                }).then(resp => {
                    if (resp.data === "处方单已成功生成！") {
                        message.success(resp.data)
                        //在处方单成功生成之后，我们需要将右边的穿梭数组移回左边，所以直接调用穿梭框变化时出发的onChange回调函数
                        //ResetKeyArr就是需要移回左边的药物元素信息的key值
                        const ResetKeyArr = RightArr.map(item => {
                            return item.key
                        })
                        this.onChange([], 'left', ResetKeyArr)

                        PubSub.publish('TotalPrice', TotalPrice)
                        PubSub.publish('AdminWork_Key', 0)

                        this.setState({ ModalVisible: false })
                    } else {
                        message.error(resp.data)
                    }
                }).catch(err => message.error(err.message))
            }
        });

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
                                    () => (<center><Button type="primary"
                                        disabled={RightArr.length === 0 ? true : false}
                                        htmlType="submit">
                                        生成病历单
                                            </Button></center>)}
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
                title: '药品名称',
            },
            {
                dataIndex: 'type',
                title: '种类',
                render: tag => <Tag>{tag}</Tag>,
            },
            {
                dataIndex: 'description',
                title: '描述',
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
                render: (Num) => (
                    <Form.Item >
                        {getFieldDecorator(Num.ID, {
                            rules: [
                                { required: true, message: '请选择药品量!' }
                            ],
                            initialValue: 1,
                            validateTrigger: 'onBlur'
                        })(<InputNumber
                            min={0}
                            max={Num.max}
                            step={1}
                            onChange={this.changeNum}
                        />)}
                    </Form.Item>
                )
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
                        {this.state.AllType.map((item, index) => {
                            return <Option key={item + index} value={item}>{item}</Option>
                        })}
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
                        filterOption={(inputValue, option) => option.medName.indexOf(inputValue) !== -1 || option.type.indexOf(inputValue) !== -1}
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
                                <Form onSubmit={this.onSure}>
                                    <Form.Item >
                                        {getFieldDecorator('DocSuggestion', {
                                            rules: [
                                                { required: true, message: '请填写医嘱!' }
                                            ],
                                            initialValue: '每天三次，每次一片',
                                            validateTrigger: 'onBlur'
                                        })(<Input.TextArea
                                            autoSize={true}
                                            placeholder='请输入医嘱'
                                            allowClear={true}
                                            style={{ marginBottom: '10px' }}
                                        />)}
                                    </Form.Item>

                                    <center><Button type="primary" htmlType='submit'>确定</Button></center>
                                </Form>
                            </div>
                        )}
                        bordered
                    />
                </Modal>
            </div>
        );
    }
}

export default connect(
    state => ({ PresInfo: state.PresInfo }),
    {}
)(Form.create()(MedSearchHeader));