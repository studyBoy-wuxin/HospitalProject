import { CHANGEDOCINFO } from '../constant'

const defaultState = []
const docInfo = (preState = defaultState, action) => {       //暴露一个方法函数，把之前定义的defaultState赋给state
    preState = []
    const { type, data } = action
    switch (type) {
        case CHANGEDOCINFO:
            return { ...data }
        default:
            return preState
    }
}

export default docInfo