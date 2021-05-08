import React, { Component } from 'react';
import { Button, Form, Input, Radio } from 'antd';

class text extends Component {

    handleSubmit = e => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values);

            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>
                        {getFieldDecorator('radiogroup', {
                            rules: [{ required: true, message: '请选择申请时间!' }],
                            initialValue: 1
                        })(<Radio.Group>
                            <Radio value={1}>A、<Input /></Radio><br />
                            <Radio value={2}>B、<Input /></Radio><br />
                            <Radio value={3}>C、<Input /></Radio><br />
                            <Radio value={4}>D、<Input /></Radio><br />
                        </Radio.Group>)}
                    </Form.Item>
                    <Button type='primary' htmlType='submit' >提交</Button>
                </Form>
            </div>
        );
    }
}

export default Form.create()(text);