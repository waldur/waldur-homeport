export let alertFormatter;
export let alertsService;

// @ngInject
export default function injectServices($injector) {
  alertFormatter = $injector.get('alertFormatter');
  alertsService = $injector.get('alertsService');
}
