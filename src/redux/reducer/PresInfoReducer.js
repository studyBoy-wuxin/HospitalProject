import { CHANGEPRESINFO } from '../constant'

const PresInfo = (preState, action) => {       //暴露一个方法函数，把之前定义的defaultState赋给state
    preState = {}
    const { type, data } = action
    switch (type) {
        case CHANGEPRESINFO:
            return data
        default:
            return preState
    }
}

export default PresInfo