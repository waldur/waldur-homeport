(function() {
  'use strict';

  angular
    // module name and dependencies
    .module('ncsaas', [
      'satellizer',
      'ui.router',
      'ngCookies',
      'ngResource',
      'duScroll',
      'ui.gravatar',
      'ui.select',
      'angularMoment',
      'ngAnimate',
      'pascalprecht.translate',
      'flash',
      'angulartics',
      'angulartics.google.analytics',
      'ngFileUpload',
      'xeditable',
      'blockUI',
      'ngSanitize',
      'leaflet-directive',
      'angular-cron-jobs',
      'ui.bootstrap',
      'angular-bind-html-compile'
    ]);
})();

(function() {
  angular.module('ncsaas').run(protectStates);

  protectStates.$inject = ['$rootScope', '$state', '$auth', 'features'];

  function protectStates($rootScope, $state, $auth, features) {
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

})();


(function() {
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

  function getCurrentUser(usersService, $q) {
    // TODO: Migrate to Angular-UI Router v1.0
    // And use $transition service which supports promises
    // https://github.com/angular-ui/ui-router/issues/1153
    return usersService.getCurrentUser().then(function(user) {
      if (usersService.mandatoryFieldsMissing(user) || !user.agreement_date) {
        return $q.reject({
          redirectTo: 'initialdata.view'
        });
      };
    });
  }

  function decorateStates($stateProvider) {
    decorateState($stateProvider, function(state) {
      if (state.data && state.data.auth && !state.resolve.currentUser) {
        state.resolve.currentUser = getCurrentUser;
      }
    });
  }

  angular.module('ncsaas').config(decorateStates);
})();

(function() {
  angular.module('ncsaas')
    .config(function($urlRouterProvider) {
      $urlRouterProvider.when('/', '/profile/');
      $urlRouterProvider.otherwise('/login/');
    });
})();

(function() {
  angular.module('ncsaas')
    .config(function(ENV) {
      angular.extend(ENV, window.$$CUSTOMENV);
      if (ENV.enableExperimental) {
        angular.extend(ENV, window.$$MODES.experimentalMode);
      } else {
        angular.extend(ENV, window.$$MODES.stableMode);
      }
    });
})();

(function() {
  angular.module('ncsaas')
    .config(function(ENV, featuresProvider) {
      featuresProvider.setFeatures(ENV.toBeFeatures.concat(ENV.disabledFeatures));
      featuresProvider.setVisibility(ENV.featuresVisible);
    });
})();

(function() {
  angular.module('ncsaas')
    .factory('httpInterceptor', [
      '$q', '$location', 'ncUtilsFlash', 'ENV', 'ErrorMessageFormatter', '$rootScope', httpInterceptor]);

    function httpInterceptor($q, $location, ncUtilsFlash, ENV, ErrorMessageFormatter, $rootScope) {
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
        'request': function(config) {
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
              console.error(errorMessage, config);
            }, ENV.requestTimeout);
          }
          return config;
        },
        'response': function(response) {
          if (response.config) {
            clearTimeout(timeouts[getKey(response.config)]);
          }
          return response;
        },
        'responseError': function(rejection) {
          if (!abortRequests) {
            var message = ErrorMessageFormatter.format(rejection);
            if (rejection.config) {
              clearTimeout(timeouts[getKey(rejection.config)]);
              console.error(message, rejection.config);
            }
            // handlers for excluding 404 errors are too slow
            if (!rejection.status || rejection.status !== 404) {
              ncUtilsFlash.error(message);
            }
          }
          return $q.reject(rejection);
        }
      };
    };

  angular.module('ncsaas')
    .config(['$httpProvider', 'blockUIConfig', errorsHandler]);

  function errorsHandler($httpProvider, blockUIConfig) {
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

  angular.module('ncsaas').run(['editableOptions', function(editableOptions) {
    editableOptions.theme = 'bs3';
  }]);

  // Close all modal dialogs when router state changed
  // http://stackoverflow.com/a/23766070/6917997
  angular.module('ncsaas').run(['$rootScope', '$uibModalStack', function($rootScope, $uibModalStack) {
    $rootScope.$on('$stateChangeSuccess', function() {
      $uibModalStack.dismissAll();
    });
  }]);

})();
