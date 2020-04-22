export let ENV = null;
export let $rootScope = null;
export let $compile = null;
export let $state = null;
export let $filter = null;
export let ngInjector = null;
export let $q = null;
// Init with identity function for testing only.
// When application is initialized, it is replaced with actual service.
export let $sanitize = x => x;

export const defaultCurrency = value =>
  $filter ? $filter('defaultCurrency')(value) : value;

export default function injectServices($injector) {
  ENV = $injector.get('ENV');
  $rootScope = $injector.get('$rootScope');
  $compile = $injector.get('$compile');
  $state = $injector.get('$state');
  $filter = $injector.get('$filter');
  $q = $injector.get('$q');
  $sanitize = $injector.get('$sanitize');
  ngInjector = $injector;
}
injectServices.$inject = ['$injector'];

/*
  Previously we have scheduled multiple concurrent REST API
  requests even if previous task has not been completed yet.
  It happens if either network or backend server is slow.
  Instead new task should be scheduled if previous have been completed.
  */
export const blockingExecutor = (callback: () => Promise<any>) => {
  let isExecuting = false;
  return () => {
    if (isExecuting) {
      return;
    }
    isExecuting = true;
    return $q.when(callback()).finally(() => (isExecuting = false));
  };
};

export const cacheInvalidationFactory = service => () =>
  ngInjector.get(service).clearAllCacheForCurrentEndpoint();
