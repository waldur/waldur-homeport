import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';
import DashboardChartContainer from './DashboardChartContainer';

const CustomerChart = ({ customer }) => (
  <DashboardChartContainer
    scope={customer}
    signal='organizationDashboard.initialized'
    chartId='customer'/>
);

export default connectAngularComponent(CustomerChart, ['customer']);
