import multiLineChart from './multi-line-chart';
import verticalBarChart from './vertical-bar-chart';
import resourceGraphs from './resource-graphs';
import resourceSla from './resource-sla';

export default module => {
  module.directive('multiLineChart', multiLineChart);
  module.directive('verticalBarChart', verticalBarChart);
  module.component('resourceGraphs', resourceGraphs);
  module.component('resourceSla', resourceSla);
};
