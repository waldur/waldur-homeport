export let DashboardChartService;

// @ngInject
export default function injectServices($injector) {
  DashboardChartService = $injector.get('DashboardChartService');
}
