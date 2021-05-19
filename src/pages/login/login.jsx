import React, { Component } from 'react';
import "./login.css";
import Snow from "../../assets/Img/snowflake.png"
import { Form, Input, Button, message, Checkbox, Radio } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { POST } from "../../api/index"
import { NavLink, Redirect } from 'react-router-dom';
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'

class login extends Component {

    state = {
        type: 'Logistic'
    }

    handleSubmit = e => {            //提交时的回调
        e.preventDefault();     //阻止表单提交的默认行为
        const { form } = this.props;    //获取到form
        form.validateFields((err, values) => {
            if (!err) {     //如果没有错误，那就输出值
                values.type = this.state.type
                console.log(values)
                //判断身份
                if (values.type === 'patient') {
                    //在传输的数据中添加一个PatID属性
                    values.PatID = values.ID
                    POST('/PatientController/Login', values)                         //将数据调用Api中的GET方法用axios发送给后端
                        .then(resp => {
                            if (resp.data.arg1 === '登陆成功') {
                                message.success(resp.data.arg1);      //登陆成功就弹出成功提示   
                                let Patient = resp.data.Patient
                                //截取字符串，去掉前面的86等前缀
                                if (Patient.telephone.substring(0, 2) === '86') {
                                    Patient.telephone = Patient.telephone.substring(2, Patient.telephone.length)
                                } else {
                                    Patient.telephone = Patient.telephone.substring(3, Patient.telephone.length)
                                }
                                //把接受来的数据都存到util模块的User.Patient中
                                memoryUtils.User = Patient
                                console.log(memoryUtils)
                                //还要把接受来的数据存放到util模块中的storageUtils中
                                storageUtils.saveUser(Patient)
                                //使用浏览器的history来进行栈的压缩，实现页面变化
                                this.props.history.replace('/userPage/OfficialServer')

                            } else {
                                message.error(resp.data.arg1)
                            }
                        })
                        .catch(err => message.error(err.message))
                } else if (values.type === 'doctor') {

                    values = JSON.parse(JSON.stringify(values).replace(/ID/g, 'EmpID'))     //把原来values中的ID字段名转换成EmpID

                    POST('/EmployeeController/Login', values)
                        .then(resp => {
                            if (resp.data.arg1 === '登陆成功' && resp.data.Employee.department === '医疗部') {
                                console.log(resp.data)
                                message.success(resp.data.arg1);      //登陆成功就弹出成功提示       
                                memoryUtils.User = resp.data.Employee
                                storageUtils.saveUser(resp.data.Employee)
                                console.log(memoryUtils)
                                this.props.history.replace('/admin')
                            } else if (resp.data.arg1 === '登陆成功' && resp.data.Employee.department !== '医疗部') {
                                message.warn(`类型错误,您是${resp.data.Employee.department}的成员!`)
                            } else {
                                message.error(resp.data.arg1)
                            }
                        })
                        .catch(err => message.error(err.message))
                } else if (values.type === 'Logistic') {
                    values = JSON.parse(JSON.stringify(values).replace(/ID/g, 'EmpID'))     //把原来values中的ID字段名转换成EmpID
                    //管理员登录
                    POST('/EmployeeController/Login', values)
                        .then(resp => {
                            if (resp.data.arg1 === '登陆成功' && resp.data.Employee.department === '后勤部') {
                                console.log(resp.data)
                                message.success(resp.data.arg1);      //登陆成功就弹出成功提示       
                                memoryUtils.User = resp.data.Employee
                                storageUtils.saveUser(resp.data.Employee)
                                console.log(memoryUtils)
                                this.props.history.replace('/LogisticsPage')
                            } else if (resp.data.arg1 === '登陆成功' && resp.data.Employee.department !== '后勤部') {
                                message.warn(`类型错误,您是${resp.data.Employee.department}的成员!`)
                            } else {
                                message.error(resp.data.arg1)
                            }
                        })
                        .catch(err => message.error(err.message))
                }
            } else {
                console.log(err)
            }
        });
    }

    render() {

        if (memoryUtils.User) {
            if (memoryUtils.User.patID) {
                return <Redirect to='/userPage/OfficialServer' />
            } else if (memoryUtils.User.department === '医疗部') {
                return <Redirect to='/admin' />
            } else if (memoryUtils.User.department === '后勤部') {
                return <Redirect to='/LogisticsPage' />
            }
        }

        const { getFieldDecorator } = this.props.form

        //设置的样式
        const formItemLayout = {
            labelCol: {
                span: 6
            },
            wrapperCol: {
                span: 18
            },
        };

        return (
            <div className="login-box">
                <header className="login-header" >
                    <img src={Snow} alt="雪花" />
                    <i>用户登录</i>
                </header>
                <section className="login-content" onClick={this.getHeight}>
                    <h2>用户登录</h2>
                    <div>
                        <Form className="login-form" onSubmit={this.handleSubmit} {...formItemLayout}>
                            <Form.Item label='ID'>
                                {
                                    getFieldDecorator("ID", {
                                        rules: [
                                            { required: true, message: '请输入ID！' },
                                        ],
                                        initialValue: '20005',
                                        validateTrigger: 'onBlur'               //校检时机：为输入框失去焦点时触发
                                    })(
                                        <Input
                                            // prefix放的是react的一个节点，意思就是可以放标签
                                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="ID"
                                            allowClear={true}

                                        />
                                    )
                                }
                            </Form.Item>
                            <Form.Item label='密码'>
                                {
                                    getFieldDecorator("Password", {
                                        rules: [
                                            { required: true, message: '请输入密码!' },
                                            { pattern: /^[a-zA-Z0-9_.]{6,12}$/, message: '请输入6到12位密码' },
                                        ],
                                        initialValue: '115128',
                                        validateTrigger: 'onBlur'               //校检时机：为输入框失去焦点时触发
                                    })(
                                        <Input.Password
                                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            type="password"
                                            placeholder="密码"
                                            allowClear={true}
                                        />
                                    )
                                }
                            </Form.Item>

                            <Form.Item label="类型">
                                {getFieldDecorator('type', {
                                    initialValue: this.state.type
                                })(<Radio.Group onChange={e => { this.setState({ type: e.target.value }) }}>
                                    <Radio value='patient'>游客</Radio>
                                    <Radio value='doctor'>医生</Radio>
                                    <Radio value='Logistic'>后勤部</Radio>
                                </Radio.Group>)}
                            </Form.Item>


                            <Form.Item style={{ position: 'relative', left: '75px' }}>
                                {
                                    getFieldDecorator('remember', {
                                        valuePropName: 'checked',
                                        initialValue: true
                                    })(
                                        <Checkbox>Remember me</Checkbox>
                                    )
                                }
                                <NavLink className="login-form-forgot" to="/FindPwd">忘记密码</NavLink>
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    登录
                                </Button>
                                还未注册?<NavLink to="/register">立即注册</NavLink>
                            </Form.Item>
                        </Form>
                    </div>
                </section>
            </div>
        );
    }
}
export default (Form.create()(login));      //暴露一个新的组件，让他的props有form属性，Form.create()()包装了一个组件，让他返回一个新的组件