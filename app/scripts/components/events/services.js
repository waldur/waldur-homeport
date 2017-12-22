export let eventFormatter;
export let eventsService;

// @ngInject
export default function injectServices($injector) {
  eventFormatter = $injector.get('eventFormatter');
  eventsService = $injector.get('eventsService');
}
