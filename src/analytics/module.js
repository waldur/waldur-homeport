import resourceAnalysisNew from './resource-analysis-new';
import resourceAnalysis from './ResourceAnalysis';
import resourceAnalysisContainer from './resource-analysis-container';
import resourceBarChart from './resource-bar-chart';
import resourcePieChart from './resource-pie-chart';
import ResourceChartService from './resource-chart-service';
import vmTypeOverview from './VmTypeOverviewContainer';

const module = angular.module('waldur.analytics', []);
module.component('resourceAnalysis', resourceAnalysis);
module.component('resourceAnalysisNew', resourceAnalysisNew);
module.component('resourceAnalysisContainer', resourceAnalysisContainer);
module.component('resourceBarChart', resourceBarChart);
module.component('vmTypeOverview', vmTypeOverview);
module.directive('resourcePieChart', resourcePieChart);
module.service('ResourceChartService', ResourceChartService);
export default module.name;
