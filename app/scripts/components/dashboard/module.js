import DashboardChartService from './dashboard-chart-service';
import { organizationDashboard } from './organization-dashboard';
import organizationChart from './chart/CustomerChart';
import projectDashboard from './ProjectDashboard';
import injectServices from './services';
import './base-quotas';

export default module => {
  module.service('DashboardChartService', DashboardChartService);
  module.component('organizationChart', organizationChart);
  module.component('organizationDashboard', organizationDashboard);
  module.component('projectDashboard', projectDashboard);
  module.run(injectServices);
};
