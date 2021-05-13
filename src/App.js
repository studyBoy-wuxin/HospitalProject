import React, { Component } from 'react';
import Admin from "./pages/admin/admin"
import Login from "./pages/login/login"
import { Route, Switch } from "react-router-dom"
import Register from './pages/register/register'
import text from './text'
import error from './assets/error/error.jsx'
import userPage from './pages/UserPage/userPage.jsx'
import LogisticsPage from './pages/LogisticsPage/LogisticsPage'

class App extends Component {


  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path='/register' component={Register} />
          <Route path='/text' component={text} />
          <Route path='/error' component={error} />
          <Route path='/LogisticsPage' component={LogisticsPage} />
          <Route path='/userPage' component={userPage} />
        </Switch>
        {/* <Redirect to="/admin" /> */}
      </div>

    );
  }
}

export default App;