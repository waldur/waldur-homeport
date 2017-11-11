import React from 'react';
import { Provider } from 'react-redux';
import { react2angular } from 'react2angular';

import store from '@waldur/store/store';
import DashboardChartContainer from './DashboardChartContainer';

const App = ({customer}) => (
  <Provider store={store}>
    <DashboardChartContainer
      scope={customer}
      signal='organizationDashboard.initialized'
      chartId='customer'/>
  </Provider>
);

export default react2angular(App, ['customer']);
