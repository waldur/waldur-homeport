export let ENV = null;
export let coreUtils = null;
export let $http = null;
export let $rootScope = null;
export let $state = null;
export let $filter = null;

// @ngInject
export default function injectServices($injector) {
  ENV = $injector.get('ENV');
  coreUtils = $injector.get('coreUtils');
  $http = $injector.get('$http');
  $rootScope = $injector.get('$rootScope');
  $state = $injector.get('$state');
  $filter = $injector.get('$filter');
}
