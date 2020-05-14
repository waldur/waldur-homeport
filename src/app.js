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
  $locationProvider.hashPrefix('');
  $urlRouterProvider.when('', '/profile/');
  $urlRouterProvider.when('/', '/profile/');
  $qProvider.errorOnUnhandledRejections(false);
}

// @ngInject
export function extendEnv(ENV) {
  angular.extend(ENV, window.$$CUSTOMENV);
  if (ENV.enableExperimental) {
    angular.extend(ENV, window.$$MODES.experimentalMode);
  } else {
    angular.extend(ENV, window.$$MODES.stableMode);
  }
}

// @ngInject
export function featuresProviderConfig(ENV, featuresProvider) {
  featuresProvider.setDisabledFeatures(
    ENV.toBeFeatures.concat(ENV.disabledFeatures),
  );
  featuresProvider.setEnabledFeatures(ENV.enabledFeatures);
  featuresProvider.setVisibility(ENV.featuresVisible);
}
