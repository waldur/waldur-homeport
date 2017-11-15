export let DashboardChartService = null;

// @ngInject
export default function injectServices($injector) {
  DashboardChartService = $injector.get('DashboardChartService');
}
