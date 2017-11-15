import * as React from 'react';
import { Provider } from 'react-redux';
import { react2angular } from 'react2angular';

import store from '@waldur/store/store';
import DashboardChartContainer from './DashboardChartContainer';

const App = ({project}) => (
  <Provider store={store}>
    <DashboardChartContainer
      scope={project}
      signal='projectDashboard.initialized'
      chartId='project'/>
  </Provider>
);

export default react2angular(App, ['project']);
