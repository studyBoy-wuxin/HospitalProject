import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { GET, POST } from '../../../../../api/index.jsx'
import PublicList from '../../List/PublicList.jsx'

class SearchSubjectHeader extends Component {

    state = {
        value: '',
        Subject: [],    //GET请求获取到所有专科数据
        mainSub: [],    //所有主专科的数据
        treeData: [],   //树选择的信息
        AllDoctorInfo: [],   //选择专科后，所对应的所有医生信息
    }

    //获取到树选择所选择的值，并发送axios请求，获取到相关分支科室的所有医生
    SelectChange = (value) => {
        const data = { BranchSubject: value }
        this.setState({
            value,
        })
        POST("/SubjectController/findDoctorByBranchSubject", data)
            .then(resp => this.setState({
                AllDoctorInfo: resp.data,
            }))
            .catch(err => err.message)
    }

    //发送get请求获取到科室信息
    componentDidMount() {
        GET('/SubjectController/findAllSubject')
            .then(resp => this.setState({ Subject: resp.data }, () => {
                const main = new Set()
                //先把数据用Set数据结构筛选出不重样的数据
                this.state.Subject.forEach((value) => {
                    main.add(value.mainSubject)
                })
                //再转变成数组形式
                const mainArr = Array.from(main)
                this.setState({ mainSub: mainArr })
                //把传递了来的数据按树选择需要的模式来封装
                const data = []
                //实际上就是使用两次for循环
                for (let i = 0; i < mainArr.length; i++) {
                    let innerArr = []
                    this.state.Subject.forEach((value, index) => {
                        /*这个for循环里，我们筛选出原数据中的mainSubject与上面封装在mainArr中的
                        数据做一个对比，因为是在内循环中，所以每个数据都会和mainArr中的数据做对比*/
                        if (value.mainSubject === mainArr[i]) {
                            //将匹配成功的数据按一定的格式push到innerArr中   
                            innerArr.push({
                                title: value.branchSubject,
                                value: value.branchSubject,
                                key: `0-${i}-${index}`,
                            })
                        }
                    })
                    //在每个内循环结束后，把数据按对象的形式push到data中
                    data.push({
                        title: mainArr[i],
                        value: mainArr[i],
                        key: `0-${i}`,
                        children: innerArr
                    })
                }
                // console.log(data)
                this.setState({
                    treeData: data
                })
            }))
            .catch(err => console.log(err))
    }

    render() {
        const { value, AllDoctorInfo } = this.state
        return (
            <div>
                <div className='TreeDiv'>
                    请选择就诊科室：
                    <TreeSelect
                        style={{ width: '80%' }}
                        value={value === '' ? null : value}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}   //如果内容被修剪，则浏览器会显示滚动条以便查看其余的内容
                        treeData={this.state.treeData}
                        placeholder="请选择就诊专科"
                        allowClear           //是否支持清除
                        showSearch          //是否展示搜索框
                        onSelect={this.SelectChange}
                    />
                </div>
                <div>
                    {/* 如果还没有搜索，即AllDoctorInfo没有值的话，就放一个''' */}
                    {AllDoctorInfo.length === 0 ? '' : <PublicList AllDoctorInfo={AllDoctorInfo} />}
                </div>
            </div>
        );
    }
}

export default SearchSubjectHeader;