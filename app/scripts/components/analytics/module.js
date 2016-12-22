import dashboardCostChart from './dashboard-cost-chart';
import costAnalysis from './cost-analysis';
import pieChart from './pie-chart';
import resourceAnalysis from './resource-analysis';
import analyticsRoutes from './routes';

export default module => {
  module.directive('dashboardCostChart', dashboardCostChart);
  module.directive('costAnalysis', costAnalysis);
  module.directive('pieChart', pieChart);
  module.directive('resourceAnalysis', resourceAnalysis);
  module.config(analyticsRoutes);
};
