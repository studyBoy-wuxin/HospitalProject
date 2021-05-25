import React, { Component } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Button,
    Select,
    Modal,
    Upload,
    Icon,
    message,
    Radio,
    Cascader
} from 'antd';
import Snow from '../../assets/Img/snowflake.png'
import './register.css';
import moment from 'moment';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from "axios"
import { Position } from '../../assets/CascaderOption/index'
import ShowPatInfo from './ShowPatInfo/ShowPatInfo'

const { Option } = Select;


const residences = Position

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class RegistrationForm extends Component {

    state = {
        date: '2001-01-01',
        telNum: '86',
        previewVisible: false,  //点击预览时，跳出对话框
        previewImage: '',
        fileList: [],
        userName: '',
        sex: 1,
        age: '',
        AdressPrefix: '广东省/广州市/天河区/',
        PatID: ''

    };

    //获取提交的数据
    handleSubmit = e => {
        const { date, telNum, sex } = this.state
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.Birth = date
                values.telephone = `${telNum}${values.telephone}`
                values.Sex = sex
                values.Address = this.state.AdressPrefix + values.Address
                console.log('获取到的表单数据是：: ', values);

                axios({
                    method: 'post',
                    url: 'http://localhost:8888/HospitalProject/PatientController/insertPatient',
                    params: { ...values, type: 'patient' }
                }).then(
                    resp => {
                        if (resp.data.arg1 === '注册成功') {
                            message.success(resp.data.arg1);      //登陆成功就弹出成功提示          
                            // this.props.history.push({ pathname: '/ShowPatInfo', state: { PatID: resp.data.PatID } })
                            this.setState({ PatID: resp.data.PatID })
                        } else {
                            message.error(resp.data)
                        }
                    })
                    .catch(err => message.error(err.message))
            }
        });
    };

    //根据身份证号码改变出生日期,性别，年龄
    getIdentityCardMessage = (event) => {
        //获取身份证上，7-14位的数字信息，获取出生日期
        const birthday = event.target.value.substring(6, 14);
        const BirthdayResult = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6, 8);
        //获取身份证上，第17位的数字信息,用来判断性别
        const Sex = event.target.value.substring(16, 17);
        let SexResult = 0;
        if (Sex % 2 === 0) {        //第17位为偶数则为女性
            SexResult = 1
        } else {                  //第17位为奇数则为男性
            SexResult = 0
        }
        //获取年龄
        const myDate = new Date();
        const age = myDate.getFullYear() - parseInt(birthday.substring(0, 4));
        this.setState({
            date: BirthdayResult,
            sex: parseInt(SexResult),
            age
        })
    }

    //上传照片--点击预览的回调
    handlePreview = async file => {
        if (!file.url && !file.preview) {       //如果文件url或者preview都不存在
            file.preview = await getBase64(file.originFileObj);
            console.log(file.originFileObj)
        }
        console.log("file.url:", file.url);
        console.log('file.preview:', file.preview)
        this.setState({
            previewImage: file.url || file.preview,     //url就是file的地址，preview是自己上传的文件的一个属性，应该是直接显现出图片
            previewVisible: true,                       //点击预览时，显示对话框
        });
    };

    //上传图片前，如果用户名为空，则提示完成上述内容
    beforeUpload = (file) => {
        if (this.state.userName === '') {
            message.error("请先完成以上内容")
            return Promise.reject()
        } else {
            return Promise.resolve(file);
        }
    }

    //获取地址前缀
    getAdressPrefix = value => {
        let result = ''
        value.forEach(date => {
            result += date + '/';
        })
        this.setState({
            AdressPrefix: result
        })
    }

    render() {

        const { getFieldDecorator } = this.props.form;
        const { previewVisible, previewImage, fileList, date, userName, sex, age, PatID } = this.state;

        //设置的样式
        const formItemLayout = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 16
            },
        };

        //定义一个节点，服务图片上传
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

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

        return (
            <div className="register-box">
                <header className="register-header">
                    <img src={Snow} alt="雪花" />
                    <i>用户注册</i>
                </header>
                <section className="register-session">
                    <h2>用户注册</h2>
                    <div>
                        {PatID === '' ? '' : <ShowPatInfo PatID={PatID} visible={true} />}
                        <Form onSubmit={this.handleSubmit} className="register-form" {...formItemLayout}>
                            <Form.Item label="姓名" hasFeedback >
                                {getFieldDecorator('Name', {
                                    rules: [
                                        { required: true, message: '请输入您的姓名!' }
                                    ]
                                })(<Input
                                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="姓名"
                                    onChange={(event) => { this.setState({ userName: event.target.value }) }}
                                />)}
                            </Form.Item>

                            <Form.Item label="密码" hasFeedback>
                                {getFieldDecorator('Password', {
                                    rules: [
                                        { required: true, message: '请输入密码!' },
                                        { pattern: /^[a-zA-Z0-9_]{6,20}$/, message: '请输入6-20位的密码！' }
                                    ],
                                    validateTrigger: 'onBlur'
                                })(<Input.Password
                                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="密码"
                                />)}
                            </Form.Item>

                            <Form.Item label="身份证号码" hasFeedback>
                                {getFieldDecorator('IdentityCard', {
                                    rules: [
                                        { required: true, message: '请输入身份证号码!' },
                                        { pattern: /^[x0-9]{18}$/, message: '请输入18位的身份证号码！' }
                                    ],
                                    validateTrigger: 'onBlur'
                                })(<Input
                                    placeholder="身份证号码"
                                    onBlur={this.getIdentityCardMessage}
                                />)}
                            </Form.Item>

                            <Form.Item label="性别">
                                {getFieldDecorator('Sex', {
                                    initialValue: sex,
                                })(<Radio.Group onChange={e => { this.setState({ sex: e.target.value }) }}>
                                    <Radio value={0}>男</Radio>
                                    <Radio value={1}>女</Radio>
                                </Radio.Group>)}
                            </Form.Item>

                            <Form.Item label="年龄">
                                {getFieldDecorator('Age', {
                                    rules: [{ required: true, message: '请输入年龄!' }],
                                    initialValue: age
                                })(<Input
                                    placeholder="年龄"
                                    onChange={(event) => { console.log(event.target.value) }}
                                />)}
                            </Form.Item>

                            <Form.Item label="出生日期">
                                {getFieldDecorator('Birth', {
                                    rules: [{ required: true, message: '请选择出生日期!' }],
                                    initialValue: date === '2001-01-01' ? moment('2001-01-01', 'YYYY- MM - DD') : moment(date, 'YYYY- MM - DD'),
                                })(<DatePicker
                                    onChange={(_, dateString) => { this.setState({ date: dateString }) }}        //获取时间
                                    format='YYYY-MM-DD'
                                    style={{ width: '266.66px' }}
                                    placeholder="出生日期"
                                />)}
                            </Form.Item>

                            <Form.Item label="电话号码">
                                {getFieldDecorator('telephone', {
                                    rules: [{ required: true, message: '请输入你的电话号码!' }]
                                })(<Input addonBefore={prefixSelector} />)}
                            </Form.Item>

                            <Form.Item label="家庭住址">
                                {getFieldDecorator('Address', {
                                    rules: [{ required: true, message: '请输入家庭住址!' }],
                                    initialValue: ''
                                })(<Input
                                    addonBefore={(
                                        <Cascader options={residences} onChange={this.getAdressPrefix}>
                                            <a href="/#">{this.state.AdressPrefix}</a>
                                        </Cascader>
                                    )} />
                                )}
                            </Form.Item>

                            <Form.Item label="上传证件照">
                                <Upload
                                    action={`http://localhost:8888/HospitalProject/PatientController/upload?userName=${userName}&type=patient`}
                                    accept='.jpg,.jpeg,.gif,.png'
                                    listType="picture-card"     //显示的样式，还有text，picture
                                    fileList={fileList}     //展示已经上传的文件列表
                                    onPreview={this.handlePreview}  //点击文件链接或预览图标时的回调
                                    onChange={({ fileList }) => this.setState({ fileList })}    //上传照片--上传照片后，重新刷新fileList的值
                                    onRemove={() => { message.success("删除成功") }}
                                    beforeUpload={this.beforeUpload}
                                    name='Photo'
                                    method='post'
                                >
                                    {fileList.length >= 2 ? null : uploadButton}
                                </Upload>
                                {/* 点击预览的时候，跳出的图片对话框 */}
                                <Modal
                                    visible={previewVisible}            //当点击预览的时候显示出来
                                    footer={null}
                                    onCancel={() => this.setState({ previewVisible: false })}        //点击图片上方的X，就改变visible为false不可见
                                >
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </Form.Item>

                            <Form.Item label=" ">
                                <Button type="primary" htmlType="submit" className="register-form-button">
                                    注册
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </section>
            </div >
        );

    }


}
export default (Form.create()(RegistrationForm));