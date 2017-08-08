import DashboardChartService from './dashboard-chart-service';
import DashboardFeedService from './dashboard-feed-service';
import { organizationDashboard } from './organization-dashboard';
import organizationChart from './chart/CustomerChart';
import projectChart from './chart/ProjectChart';
import { projectDashboard } from './project-dashboard';
import { projectAlertsFeed } from './project-alerts-feed';
import { projectEventsFeed } from './project-events-feed';
import injectServices from './services';

export default module => {
  module.service('DashboardChartService', DashboardChartService);
  module.service('DashboardFeedService', DashboardFeedService);
  module.component('organizationChart', organizationChart);
  module.component('organizationDashboard', organizationDashboard);
  module.component('projectChart', projectChart);
  module.component('projectDashboard', projectDashboard);
  module.component('projectAlertsFeed', projectAlertsFeed);
  module.component('projectEventsFeed', projectEventsFeed);
  module.run(injectServices);
};
