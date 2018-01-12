export let ENV = null;
export let $http: angular.IHttpService;
export let $rootScope = null;
export let $state = null;
export let $filter = null;
export let ngInjector = null;

export default function injectServices($injector) {
  ENV = $injector.get('ENV');
  $http = $injector.get('$http');
  $rootScope = $injector.get('$rootScope');
  $state = $injector.get('$state');
  $filter = $injector.get('$filter');
  ngInjector = $injector;
}
injectServices.$inject = ['$injector'];
