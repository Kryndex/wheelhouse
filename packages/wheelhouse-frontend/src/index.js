import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import "milligram";
import { Provider } from "react-redux";
import DevelopmentDataDisplay
  from "./components/development-data/DevelopmentDataDisplay";
import EnvironmentVariablesDisplay
  from "./components/environment-variables/EnvironmentVariablesDisplay";
import LogsDataDisplay from "./components/logs-data/LogsDataDisplay";
import PodsDataDisplay from "./components/kubectl-data/PodsDataDisplay";
import NotificationDisplay
  from "./components/notifications/NotificationDisplay";
import getStore from "./store";
import "./index.css";

getStore.then(store => {
  const routes = (
    <Provider store={store}>
      <Router>
        <div>
          <Route path="/development" component={DevelopmentDataDisplay} />
          <Route path="/logs" component={LogsDataDisplay} />
          <Route path="/pods" component={PodsDataDisplay} />
          <Route
            path="/environment-variables"
            component={EnvironmentVariablesDisplay}
          />
          <Route path="/sms" component={NotificationDisplay} />
        </div>
      </Router>
    </Provider>
  );

  ReactDOM.render(routes, document.getElementById("root"));
});
//          <Route path='/sms' component={notifications} />
