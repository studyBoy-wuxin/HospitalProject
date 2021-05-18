import React, { Component } from 'react';
import { Layout, Table, Button, Divider, Modal, Form, Cascader, Input, Radio, DatePicker, Select, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './ownerMes.css'
import { withRouter } from 'react-router-dom'
import memoryUtils from '../../../utils/memoryUtils'
import { Position } from '../../../assets/CascaderOption/index'
import moment from 'moment';
import { POST } from '../../../api/index.jsx'

const { Content } = Layout;
const residences = Position
const { Option } = Select;
class MyLayout extends Component {

    state = {
        Doctor: memoryUtils.User,
        ModalVisible: false,
        AddressPrefix: '',
        telNum: '86',
        date: ''
    }

    //获取提交的数据
    handleSubmit = e => {
        const { date, telNum } = this.state
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.Birth = date
                values.Telephone = `${telNum}${values.Telephone}`
                values.EmpID = this.state.Doctor.empID
                values.Address = this.state.AddressPrefix + values.Address
                console.log('获取到的表单数据是： ', values);
                POST('/EmployeeController/UpdateEmployee', values)
                    .then(resp => {
                        console.log(resp)
                        if (resp.data === '修改成功') {
                            message.success(resp.data);      //登陆成功就弹出成功提示        
                            this.props.form.resetFields()           //重置Form所有组件的状态                                                       
                        } else {
                            message.error(resp.data)
                        }
                    })
                    .catch(err => message.error(err.message))
            }
        });
    };

    componentDidMount() {
        const { Doctor } = this.state
        const { address, birth } = this.state.Doctor
        POST('/DoctorController/findDocterById', { DocID: Doctor.empID, type: 'doctor' })
            .then(resp => {
                console.log(resp.data);
                this.setState({
                    AddressPrefix: address.substring(0, address.lastIndexOf("/") + 1),
                    date: birth,
                    Doctor: { ...Doctor, branchSubject: resp.data.branchSubject }
                })
            })
            .catch(err => message.error(err.message))

    }

    //获取到地址选择的数据
    getAddressPrefix = value => {
        console.log('选择的地址是：', value)
        let result = ''
        value.forEach(date => {
            result += date + '/';
        })
        this.setState({
            AddressPrefix: result
        })
        console.log(result)
    }

    render() {

        const { age, birth, department, empID, name, sex, address, telephone, branchSubject } = this.state.Doctor
        console.log(this.state.Doctor);
        const { getFieldDecorator } = this.props.form;
        //定义一个变量为一个Select节点，服务电话号码
        const prefixSelector = (
            <Select
                style={{ width: 70 }}
                onChange={(value) => { this.setState({ telNum: value }) }}     //电话前缀
                defaultValue='86'>
                <Option value="86">+86</Option>
                <Option value="886">+886</Option>
                <Option value="852">+852</Option>
                <Option value="853">+853</Option>
            </Select>
        );

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

        const dataSource = [
            {
                key: '1',
                FirstCol: '工号:',
                SecondCol: empID
            },
            {
                key: '2',
                FirstCol: '姓名:',
                SecondCol: name
            },
            {
                key: '3',
                FirstCol: '性别:',
                SecondCol: sex === 0 ? '男' : '女',
            },
            {
                key: '4',
                FirstCol: '年龄:',
                SecondCol: age
            },
            {
                key: '5',
                FirstCol: '联系电话:',
                SecondCol: telephone
            },
            {
                key: '6',
                FirstCol: '出生日期:',
                SecondCol: birth
            },
            {
                key: '7',
                FirstCol: '家庭住址:',
                SecondCol: address
            },
            {
                key: '8',
                FirstCol: '所在科室:',
                SecondCol: `${department}—${branchSubject}科`
            },
            {
                key: '9',
                FirstCol: '是否修改个人信息:',
                SecondCol: <Button type='primary' onClick={() => this.setState({ ModalVisible: true })}>修改资料</Button>
            }
        ];

        const FormDataSource = [
            {
                key: '1',
                FirstCol: '姓名',
                SecondCol: (<Form.Item hasFeedback >
                    {getFieldDecorator('Name', {
                        rules: [
                            { required: true, message: '请输入您的姓名!' }
                        ],
                        initialValue: name,
                        validateTrigger: 'onBlur'
                    })(<Input
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="姓名"
                        onChange={(event) => { this.setState({ userName: event.target.value }) }}
                    />)}
                </Form.Item>)
            },
            {
                key: '2',
                FirstCol: '性别',
                SecondCol: (<Form.Item>
                    {getFieldDecorator('Sex', {
                        initialValue: sex,
                    })(<Radio.Group onChange={e => { this.setState({ sex: e.target.value }) }}>
                        <Radio value={0}>男</Radio>
                        <Radio value={1}>女</Radio>
                    </Radio.Group>)}
                </Form.Item>
                )
            },
            {
                key: '3',
                FirstCol: '年龄',
                SecondCol: (<Form.Item>
                    {getFieldDecorator('Age', {
                        rules: [{ required: true, message: '请输入年龄!' }],
                        initialValue: age
                    })(<Input
                        placeholder="年龄"
                        onChange={(event) => { console.log(event.target.value) }}
                    />)}
                </Form.Item>
                )
            },
            {
                key: '4',
                FirstCol: '出生日期',
                SecondCol: (<Form.Item>
                    {getFieldDecorator('Birth', {
                        rules: [{ required: true, message: '请选择出生日期!' }],
                        initialValue: moment(birth, 'YYYY- MM - DD'),
                    })(<DatePicker
                        onChange={(_, dateString) => { this.setState({ date: dateString }) }}        //获取时间
                        format='YYYY-MM-DD'
                        style={{ width: '266.66px' }}
                        placeholder="出生日期"
                    />)}
                </Form.Item>
                )
            },
            {
                key: '5',
                FirstCol: '电话号码',
                SecondCol: (<Form.Item>
                    {getFieldDecorator('Telephone', {
                        rules: [{ required: true, message: '请输入你的电话号码!' }],
                        initialValue: telephone
                    })(<Input addonBefore={prefixSelector} />)}
                </Form.Item>
                )
            },
            {
                key: '6',
                FirstCol: '家庭住址',
                SecondCol: (<Form.Item>
                    {getFieldDecorator('Address', {
                        rules: [{ required: true, message: '请输入家庭住址!' }],
                        initialValue: address.substring(address.lastIndexOf("/") + 1, address.length)
                    })(<Input
                        addonBefore={(
                            <Cascader
                                options={residences}
                                onChange={this.getAddressPrefix}
                                expandTrigger='hover'
                            >
                                <a href="/#">{this.state.AddressPrefix}</a>
                            </Cascader>
                        )} />
                    )}
                </Form.Item>
                )
            },
            {
                key: '8',
                FirstCol: '',
                SecondCol: (
                    <Button type="primary" htmlType="submit" className="register-form-button">
                        修改
                    </Button>
                )
            },
        ]

        return (
            <Content style={{ height: '120%' }}>
                <div className="ownerMes-Content" >
                    <div className='ownerMes-Content-box'>
                        <div>
                            个人信息
                        </div>
                        <Divider />
                        <div className='ownerMes-Content-Table'>
                            <Table
                                style={{ width: '700px' }}
                                dataSource={dataSource}
                                columns={columns}
                                showHeader={false}
                                pagination={false}
                                bordered
                            />
                        </div>

                        <Modal
                            title="修改个人信息"
                            visible={this.state.ModalVisible}
                            footer={null}
                            onCancel={() => { this.setState({ ModalVisible: false }) }}
                            keyboard={true}
                            bodyStyle={{ width: '600px' }}
                            width={600}
                        >
                            <Form onSubmit={this.handleSubmit} className='OwnerMessage-Form'>
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
        );
    }
}

export default Form.create()(withRouter(MyLayout));