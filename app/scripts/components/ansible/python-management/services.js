export let resourcesService = null;

// @ngInject
export default function injectServices($injector) {
  resourcesService = $injector.get('resourcesService');
}
