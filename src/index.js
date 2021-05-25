import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom"
import App from './App'
import memoryUtils from './utils/memoryUtils'
import storageUtils from './utils/storageUtils'
import { Provider } from 'react-redux'
import store from './redux/store'

//读取local保存的user
memoryUtils.User = storageUtils.getUser()

ReactDOM.render(
    <HashRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </HashRouter>
    , document.getElementById('root')
);
