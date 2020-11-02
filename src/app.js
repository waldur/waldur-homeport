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

// @ngInject
export function extendEnv(ENV) {
  Object.assign(ENV, window.$$CUSTOMENV);
  if (ENV.enableExperimental) {
    Object.assign(ENV, window.$$MODES.experimentalMode);
  } else {
    Object.assign(ENV, window.$$MODES.stableMode);
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
