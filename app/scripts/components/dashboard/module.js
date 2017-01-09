import DashboardChartService from './dashboard-chart-service';
import DashboardFeedService from './dashboard-feed-service';
import { dashboardChart } from './dashboard-chart';
import { organizationDashboard } from './organization-dashboard';
import { projectDashboard } from './project-dashboard';
import { projectAlertsFeed } from './project-alerts-feed';
import { projectEventsFeed } from './project-events-feed';

export default module => {
  module.service('DashboardChartService', DashboardChartService);
  module.service('DashboardFeedService', DashboardFeedService);
  module.component('dashboardChart', dashboardChart);
  module.component('organizationDashboard', organizationDashboard);
  module.component('projectDashboard', projectDashboard);
  module.component('projectAlertsFeed', projectAlertsFeed);
  module.component('projectEventsFeed', projectEventsFeed);
};
