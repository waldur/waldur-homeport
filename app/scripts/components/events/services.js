export let eventFormatter = null;

// @ngInject
export default function injectServices($injector) {
  eventFormatter = $injector.get('eventFormatter');
}
