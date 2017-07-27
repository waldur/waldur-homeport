import dashboardCostChart from './dashboard-cost-chart';
import costAnalysis from './cost-analysis';
import resourceAnalysis from './resource-analysis-new';
import resourceBarChart from './resource-bar-chart';
import resourcePieChart from './resource-pie-chart';
import ResourceChartService from './resource-chart-service';
import analyticsRoutes from './routes';

export default module => {
  module.directive('dashboardCostChart', dashboardCostChart);
  module.directive('costAnalysis', costAnalysis);
  module.component('resourceAnalysis', resourceAnalysis);
  module.component('resourceBarChart', resourceBarChart);
  module.directive('resourcePieChart', resourcePieChart);
  module.service('ResourceChartService', ResourceChartService);
  module.config(analyticsRoutes);
};
