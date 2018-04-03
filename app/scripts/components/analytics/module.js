import resourceAnalysis from './resource-analysis-new';
import resourceBarChart from './resource-bar-chart';
import resourcePieChart from './resource-pie-chart';
import ResourceChartService from './resource-chart-service';

const module = angular.module('waldur.analytics', []);
module.component('resourceAnalysis', resourceAnalysis);
module.component('resourceBarChart', resourceBarChart);
module.directive('resourcePieChart', resourcePieChart);
module.service('ResourceChartService', ResourceChartService);
export default module.name;
