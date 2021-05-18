import React, { Component } from 'react';
import { message, Table, Button, Input, Modal, Form } from 'antd';
import { POST } from '../../../../api/index'
import './index.css'

//展示申请确认表的列
const AddColumns = [
    {
        dataIndex: 'FirstCol',
        key: 'FirstCol',
        align: 'center',
        render: (value, _, index) => {
            const obj = { children: value, props: {} };
            //在新增按钮的那一行，就设置为占两个格
            if (index === 6) { obj.props.colSpan = 2 }
            return obj
        }
    },
    {
        dataIndex: 'SecondCol',
        key: 'SecondCol',
        align: 'center',
        render: (value, _, index) => {
            const obj = { children: value, props: {} };
            //colSpan = 0表示不渲染 
            if (index === 6) { obj.props.colSpan = 0 }
            return obj
        }
    }
]

class AddComponent extends Component {

    state = {
        AddVisible: false,
    }

    AddHandleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                POST('/MedEquController/insertMedEqu', { ...values })
                    .then(resp => {
                        if (resp.data === 1) {
                            message.success('新增成功')
                            values.key = values.EqID
                            values.OtherInfo = { EqID: values.EqID }
                            this.props.form.resetFields()           //重置Form所有组件的状态
                            console.log(values);
                            //调用父组件的更新方法，让新增的内容展示到页面上
                            this.props.updatePageAfterAdd(values)
                            this.setState({ AddVisible: false })
                        } else {
                            message.error('新增失败')
                        }
                    })
                    .catch(err => message.error(err.message))
            }
        })
    }

    render() {
        const { AddVisible } = this.state
        const { getFieldDecorator } = this.props.form;
        const AddDataSource = [
            {
                key: 'AddID',
                FirstCol: 'ID',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('EqID', {
                        rules: [{ required: true, message: '请输入ID!' }],
                    })(<Input placeholder="请输入ID" />)}
                </Form.Item>)
            },
            {
                key: 'AddName',
                FirstCol: '名称',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('EqName', {
                        rules: [{ required: true, message: '请输入名称!' }],
                    })(<Input placeholder="请输入名称" />)}
                </Form.Item>)
            },
            {
                key: 'AddType',
                FirstCol: '类型',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('Type', {
                        rules: [{ required: true, message: '请输入类型!' }],
                    })(<Input placeholder="请输入类型" />)}
                </Form.Item>)
            },
            {
                key: 'AddAddress',
                FirstCol: '存放地址',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('EqAddress', {
                        rules: [{ required: true, message: '请输入存放地址!' }],
                    })(<Input placeholder="请输入存放地址" />)}
                </Form.Item>)
            },
            {
                key: 'AddDescription',
                FirstCol: '描述',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('EqDescription', {
                        rules: [{ required: true, message: '请输入描述!' }],
                    })(<Input placeholder="请输入描述" />)}
                </Form.Item>)
            },
            {
                key: 'Addvalue',
                FirstCol: '价值',
                SecondCol: (<Form.Item hasFeedback>
                    {getFieldDecorator('value', {
                        rules: [{ required: true, message: '请输入价值!' }, { pattern: /^[0-9]{1,8}$/, message: '请输入1-8位数字！' }],
                    })(<Input placeholder="请输入价值" />)}
                </Form.Item>)
            },
            {
                key: 'AddBtn',
                FirstCol: <Button htmlType='submit' type='primary' style={{ width: '90%' }}>新增</Button>,
                SecondCol: null
            }
        ]

        return (
            <div>
                <p style={{ textAlign: 'end' }}>
                    <Button type='primary' onClick={() => this.setState({ AddVisible: true })}>新增</Button>
                </p>
                {/* 新增弹出的对话框 */}
                <Modal
                    title='新增医疗资源'
                    visible={AddVisible}
                    onCancel={() => this.setState({ AddVisible: false })}
                    keyboard={true}
                    bodyStyle={{ width: '600px' }}
                    width={600}
                    footer={null}
                >
                    <Form onSubmit={this.AddHandleSubmit} className='OperateMedEqu-AddForm'>
                        <Table
                            dataSource={AddVisible === true ? AddDataSource : []}
                            columns={AddColumns}
                            showHeader={false}
                            pagination={false}
                            bordered
                        />
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default Form.create()(AddComponent);