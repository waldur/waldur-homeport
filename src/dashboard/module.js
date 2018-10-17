import { organizationDashboard } from './organization-dashboard';
import organizationChart from './chart/CustomerChart';
import projectDashboard from './ProjectDashboard';
import './base-quotas';

export default module => {
  module.component('organizationChart', organizationChart);
  module.component('organizationDashboard', organizationDashboard);
  module.component('projectDashboard', projectDashboard);
};
