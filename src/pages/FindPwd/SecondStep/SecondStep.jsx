import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd'
import { POST } from '../../../api'
import PubSub from 'pubsub-js'

class SecordStep extends Component {

    state = { Password: '', PatID: '' }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.PatID !== prevState.PatID) {
            return { PatID: nextProps.PatID }
        }
        return null;
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {          //这里的values采用的是{medID:num}这样的对象形式，标识有多少这个药品
            if (!err) {
                const { PatID } = this.state
                console.log(values, PatID);
                delete values.NewPassword

                POST('/PatientController/UpdatePwdStep2', { PatID, ...values, type: 'patient' })
                    .then(resp => {
                        if (resp.data > 0) {
                            message.success('修改成功!')
                            PubSub.publish('current', 2)
                        } else {
                            message.error('修改失败!')
                        }
                    })
                    .catch(err => message.error(err.message))
            }
        })
    }

    validator = (_, value, callback) => {
        const { Password } = this.state
        if (value !== Password) {
            callback('两次输入的密码不一致')
        } else {
            callback()
        }
    }

    componentDidMount() { this.setState({ PatID: this.props.PatID }) }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <Form onSubmit={this.handleSubmit} style={{ width: '400px' }}>
                        <Form.Item>
                            {getFieldDecorator('Password', {
                                rules: [{ required: true, message: '请输入您的新密码!' }, { pattern: /^[0-9]{6,20}$/, message: '必须输入6~20位数字!' }]
                            })(<Input.Password
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='新密码'
                                onChange={e => this.setState({ Password: e.target.value })} />)}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('NewPassword', {
                                rules: [{ required: true, message: '请再次输入您的密码!' }, { validator: this.validator }],
                            })(<Input.Password
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='再次输入' />)}
                        </Form.Item>
                        <p style={{ textAlign: 'center' }}>
                            <Button type='dashed' onClick={() => this.props.form.resetFields()} style={{ marginRight: '10px' }}>重置</Button>
                            <Button type='primary' htmlType='submit'>确认</Button>
                        </p>
                    </Form>
                </div>
            </div>
        );
    }
}

export default Form.create()(SecordStep);