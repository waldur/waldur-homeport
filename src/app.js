// @ngInject
export function protectStates($rootScope, $state) {
  $rootScope.$state = $state;
}

// @ngInject
export function urlRouterProvider(
  $urlRouterProvider,
  $locationProvider,
  $qProvider,
) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.when('', '/profile/');
  $urlRouterProvider.when('/', '/profile/');
  $qProvider.errorOnUnhandledRejections(false);
}
