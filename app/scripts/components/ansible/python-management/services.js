// services.js
export let AppstoreProvidersService = null;
export let currentStateService = null;
export let resourcesService = null;
// @ngInject
export default function injectServices($injector) {
  AppstoreProvidersService = $injector.get('AppstoreProvidersService');
  currentStateService = $injector.get('currentStateService');
  resourcesService = $injector.get('resourcesService');
}
