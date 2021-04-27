import { SHOWPAGE_KEY } from '../constant'

const defaultState = 0

const docInfo = (preState = defaultState, action) => {       //暴露一个方法函数，把之前定义的defaultState赋给state
    const { type, data } = action
    switch (type) {
        case SHOWPAGE_KEY:
            return data
        default:
            return preState
    }
}

export default docInfo