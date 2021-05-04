import React, { Component } from 'react';
import { List } from 'antd';
import './index.css'
import doctor from '../../../../../assets/Img/doctor.jpg'
import { POST } from '../../../../../api/index.jsx'
import { connect } from 'react-redux'
import { ChangeKeyAction } from '../../../../../redux/action/PageKeyAction'
import { ChangeDocInfoAction } from '../../../../../redux/action/DocInfoAction'

//这是抽取出来的一个组件，只要传入AllDoctorInfo(搜索的医生)信息即可
class PublicList extends Component {

    state = {
        AllDoctorInfo: [],   //选择专科后，所对应的所有医生信息
    }

    //点击医生的时候，通过ID获取医生的个人信息
    ShowDoctorInfo = (ID) => {
        return (event) => {
            event.preventDefault();             //阻止默认的跳转行为
            const data = { DocID: ID, type: 'doctor' }
            POST('/DoctorController/findDocterById', data)
                .then(resp => {
                    this.props.ChangeKey(1)                        // SearchSubject.jsx接收

                    this.props.ChangeDocInfo(resp.data)                   //医生信息发送给SearchSubject接收
                })
                .catch(err => console.log(err.message))
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.AllDoctorInfo !== prevState.AllDoctorInfo) {
            return {
                AllDoctorInfo: nextProps.AllDoctorInfo,
            };
        }
        return null;
    }

    render() {
        const { AllDoctorInfo } = this.state

        return (
            <div>
                <div className='contentDiv' style={{ width: '89.8%', marginTop: '10px' }}>
                    <div>
                        <List
                            style={{ display: AllDoctorInfo.length === 0 ? 'none' : 'block' }}
                            itemLayout="horizontal"
                            bordered={true}
                            dataSource={AllDoctorInfo}
                            renderItem={(item, index) => (
                                <List.Item key={item + index}>
                                    <a href="/" onClick={this.ShowDoctorInfo(item.docID)}>
                                        <List.Item.Meta
                                            avatar={<img className='List-Avater' src={doctor} alt="医生" />}
                                            title={item.name}
                                            description={item.position}
                                        />
                                    </a>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    () => ({}),
    {
        ChangeKey: ChangeKeyAction,
        ChangeDocInfo: ChangeDocInfoAction
    }
)(PublicList);
