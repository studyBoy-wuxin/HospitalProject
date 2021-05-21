import React, { Component, lazy, Suspense } from 'react';
import { Route, Switch } from "react-router-dom"
import Fallback from './assets/fallback/fallback'


//开启懒加载模式
const Login = lazy(() => import('./pages/login/login'))
const Admin = lazy(() => import('./pages/admin/admin'))
const Register = lazy(() => import('./pages/register/register'))
const text = lazy(() => import('./text'))
const error = lazy(() => import('./assets/error/error'))
const userPage = lazy(() => import('./pages/UserPage/userPage'))
const LogisticsPage = lazy(() => import('./pages/LogisticsPage/LogisticsPage'))
const FindPwd = lazy(() => import('./pages/FindPwd/FindPwd'))

class App extends Component {


  render() {
    return (
      //错误边界包裹 
      <div style={{ height: "100%", width: "100%" }}>
        {/* 开启懒加载模式的时候一定得加上Suspense，因为这个是在加载不出来的时候显示的 */}
        <Suspense fallback={<Fallback />}>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/admin" component={Admin} />
            <Route path='/register' component={Register} />
            <Route path='/text' component={text} />
            <Route path='/error' component={error} />
            <Route path='/LogisticsPage' component={LogisticsPage} />
            <Route path='/userPage' component={userPage} />
            <Route path='/FindPwd' component={FindPwd} />
          </Switch>
        </Suspense>
      </div>
    );
  }
}

export default App;