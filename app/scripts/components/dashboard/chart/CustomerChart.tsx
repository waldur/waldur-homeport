import * as React from 'react';

import { connectAngularComponent } from '@waldur/core/reactHelper';
import DashboardChartContainer from './DashboardChartContainer';

const App = ({ customer }) => (
  <DashboardChartContainer
    scope={customer}
    signal='organizationDashboard.initialized'
    chartId='customer'/>
);

export default connectAngularComponent(App, ['customer']);
