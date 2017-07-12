// @ngInject
export function protectStates($rootScope, $state, $auth, features) {
  // 1) If state data has `disabled` flag, user is redirected to dashboard.

  // 3) If state data has `anonymous` flag and user has authentication token,
  // he is redirected to dashboard.

  // 4) If state data has `feature` field and this feature is disabled,
  // user is redirected to 404 error page.

  $rootScope.$state = $state;

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      var nextState = getNextState();
      if (nextState) {
        event.preventDefault();
        $state.go(nextState);
      }

      function getNextState() {
        var data = toState.data;
        if (!data) {
          return;
        } else if (data.disabled) {
          return 'errorPage.notFound';
        } else if (data.anonymous && $auth.isAuthenticated()) {
          return 'profile.details';
        } else if (data.feature && !features.isVisible(data.feature)) {
          return 'errorPage.notFound';
        }
      }

      $rootScope.prevPreviousState = fromState;
      $rootScope.prevPreviousParams = fromParams;
    });
}

// @ngInject
function decorateState($stateProvider, decorator) {
  $stateProvider.decorator('views', function(state, parent) {
    var result = {}, views = parent(state);

    angular.forEach(views, function(config, name) {
      config.resolve = config.resolve || {};
      decorator(config);
      result[name] = config;
    });

    return result;
  });
}

// @ngInject
function getCurrentUser(usersService, $q) {
  // TODO: Migrate to Angular-UI Router v1.0
  // And use $transition service which supports promises
  // https://github.com/angular-ui/ui-router/issues/1153
  return usersService.getCurrentUser().then(function(user) {
    if (usersService.mandatoryFieldsMissing(user) || !user.agreement_date) {
      return $q.reject({
        redirectTo: 'initialdata.view'
      });
    }
  });
}

// @ngInject
export function decorateStates($stateProvider) {
  decorateState($stateProvider, function(state) {
    if (state.data && state.data.auth && !state.resolve.currentUser) {
      state.resolve.currentUser = getCurrentUser;
    }
  });
}

// @ngInject
export function urlRouterProvider($urlRouterProvider) {
  $urlRouterProvider.when('/', '/profile/');
  $urlRouterProvider.otherwise('/login/');
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
  featuresProvider.setFeatures(ENV.toBeFeatures.concat(ENV.disabledFeatures));
  featuresProvider.setVisibility(ENV.featuresVisible);
}

// @ngInject
export function httpInterceptor($q, $location, ncUtilsFlash, ENV, ErrorMessageFormatter, $rootScope) {
  var timeouts = {},
    abortRequests;
  function getKey(config) {
    return config.url + config.method + JSON.stringify(config.params);
  }
  $rootScope.$on('abortRequests', function() {
    abortRequests = true;
  });
  $rootScope.$on('enableRequests', function() {
    abortRequests = false;
  });

  return {
    request: function(config) {
      if (abortRequests && !(/^views.*\/(.*?).html$/.test(config.url))) {
        var canceler = $q.defer();
        config.timeout = canceler.promise;
        canceler.resolve();
      } else {
        if (timeouts[getKey(config)]) {
          clearTimeout(timeouts[getKey(config)]);
        }
        timeouts[getKey(config)] = setTimeout(function() {
          var errorMessage = 'Problem getting response from the server.';
          ncUtilsFlash.error(errorMessage);
          // eslint-disable-next-line no-console
          console.error(errorMessage, config);
        }, ENV.requestTimeout);
      }
      return config;
    },
    response: function(response) {
      if (response.config) {
        clearTimeout(timeouts[getKey(response.config)]);
      }
      return response;
    },
    responseError: function(rejection) {
      if (!abortRequests) {
        var message = ErrorMessageFormatter.format(rejection);
        if (rejection.config) {
          clearTimeout(timeouts[getKey(rejection.config)]);
          // eslint-disable-next-line no-console
          console.error(message, rejection.config);
        }
      }
      return $q.reject(rejection);
    }
  };
}

// @ngInject
export function errorsHandler($httpProvider, blockUIConfig) {
  blockUIConfig.autoBlock = false;
  blockUIConfig.delay = 500;
  $httpProvider.interceptors.push('httpInterceptor');

  blockUIConfig.requestFilter = function(config) {
    if(config.hasOwnProperty('params') && config.params.hasOwnProperty('DONTBLOCK')) {
      delete config.params.DONTBLOCK;
      return false;
    }
  };
}

// @ngInject
export function setEditableOptions(editableOptions) {
  editableOptions.theme = 'bs3';
}

// @ngInject
export function closeDialogs($rootScope, $uibModalStack) {
  $rootScope.$on('$stateChangeSuccess', function() {
    $uibModalStack.dismissAll();
  });
}
