import { $rootScope } from '@waldur/core/services';
import { DashboardChartService } from '@waldur/dashboard/services';

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
