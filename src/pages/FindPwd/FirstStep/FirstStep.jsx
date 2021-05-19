import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd'
import { POST } from '../../../api/index'
import PubSub from 'pubsub-js'

class FirstStep extends Component {

    state = {
        PatID: '',
        IdentityCard: ''
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {          //这里的values采用的是{medID:num}这样的对象形式，标识有多少这个药品
            if (!err) {
                console.log(values);
                POST('/PatientController/UpdatePwdStep1', { ...values, type: 'patient' })
                    .then(resp => {
                        console.log(resp.data);
                        if (resp.data === 1) {
                            message.success('验证成功')
                            PubSub.publish('current', 1)
                            this.setState({ PatID: values.PatID }, () => PubSub.publish('PatID', this.state.PatID))
                        } else if (resp.data === 0) {
                            message.error('身份证号不正确')
                        } else {
                            message.error('该用户不存在')
                        }
                    })
                    .catch(err => message.error(err.message))
            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <Form onSubmit={this.handleSubmit} style={{ width: '400px' }}>
                        <Form.Item>
                            {getFieldDecorator('PatID', {
                                rules: [{ required: true, message: '请输入您的账号!' }, { pattern: /^[0-9]\d*$/, message: '账号类型错误!' }]
                            })(<Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='账号' />)}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('IdentityCard', {
                                rules: [{ required: true, message: '请输入您的身份证号码!' }],
                            })(<Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='身份证号码' />)}
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

export default Form.create()(FirstStep);