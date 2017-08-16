import { DashboardChartService, $rootScope } from '../services';

function fetchChart(chartId, scope) {
  if (chartId === 'customer') {
    return DashboardChartService.getOrganizationCharts(scope);
  } else if (chartId === 'project') {
    return DashboardChartService.getProjectCharts(scope);
  }
}

function emitSignal(signal) {
  $rootScope.$broadcast(signal);
}

export default {
  fetchChart,
  emitSignal,
};
