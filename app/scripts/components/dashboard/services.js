export let DashboardChartService = null;
export let $rootScope = null;

export default function injectServices($injector) {
  DashboardChartService = $injector.get('DashboardChartService');
  $rootScope = $injector.get('$rootScope');
}
