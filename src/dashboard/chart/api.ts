import { DashboardChartService } from '@waldur/dashboard/services';

export function fetchChart(chartId, scope) {
  if (chartId === 'customer') {
    return DashboardChartService.getOrganizationCharts(scope);
  } else if (chartId === 'project') {
    return DashboardChartService.getProjectCharts(scope);
  }
}
