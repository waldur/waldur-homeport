import * as React from 'react';

import { connectAngularComponent } from '@waldur/table-react/utils';
import DashboardChartContainer from './DashboardChartContainer';

const App = ({ project }) => (
  <DashboardChartContainer
    scope={project}
    signal='projectDashboard.initialized'
    chartId='project'/>
);

export default connectAngularComponent(App, ['project']);
