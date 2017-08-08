import { DashboardChartService, $rootScope } from '../services';

export function fetchChart(chartId, scope) {
  if (chartId === 'customer') {
    return DashboardChartService.getOrganizationCharts(scope);
  } else if (chartId === 'project') {
    return DashboardChartService.getProjectCharts(scope);
  }
}

export function emitSignal(signal) {
  $rootScope.$broadcast(signal);
}
