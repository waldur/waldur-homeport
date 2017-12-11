import * as React from 'react';

import DashboardChartContainer from './DashboardChartContainer';

const ProjectChart = ({ project }) => (
  <DashboardChartContainer
    scope={project}
    signal='projectDashboard.initialized'
    chartId='project'/>
);

export {
  ProjectChart,
};
