export let eventsService;

// @ngInject
export default function injectServices($injector) {
  eventsService = $injector.get('eventsService');
}
