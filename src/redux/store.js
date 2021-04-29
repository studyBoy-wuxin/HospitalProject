//store仓库

/*
引入redux的createStore：创造仓库；
applyMiddleware：中间件，支持异步action；
combineReducers：整合所有Reducer
*/
import { createStore, applyMiddleware, combineReducers } from 'redux'
//引入reducer
import PageKeyReducer from './reducer/PageKeyReducer'
import DocInfoReducer from './reducer/DocInfoReducer'
import PresInfoReducer from './reducer/PresInfoReducer'
//引入thunk，支持异步action
import thunk from 'redux-thunk'
//引入composeWithDevTools，支持浏览器中redux插件的使用
import { composeWithDevTools } from 'redux-devtools-extension'
//将所有Reducer整合
const AllReducer = combineReducers({
    PageKey: PageKeyReducer,
    DocInfo: DocInfoReducer,
    PresInfo: PresInfoReducer
})
//暴露store
export default createStore(AllReducer, composeWithDevTools(applyMiddleware(thunk)))