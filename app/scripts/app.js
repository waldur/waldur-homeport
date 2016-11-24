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
      'ui.bootstrap',
      'ui.slimscroll'
    ])
})();

(function() {
  angular.module('ncsaas').run(protectStates);

  protectStates.$inject = ['$rootScope', '$state', '$auth', 'ENV'];

  function protectStates($rootScope, $state, $auth, ENV) {
    // 1) If state data has `disabled` flag, user is redirected to dashboard.

    // 2) If state data has `auth` flag and user does not have authentication token,
    // he is redirected to login page.

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
          return 'dashboard.index';
        } else if (data.auth && !$auth.isAuthenticated()) {
          return 'login';
        } else if (data.anonymous && $auth.isAuthenticated() && !data.invitation) {
          console.log('here 3', event, toState, toParams);
          return 'dashboard.index';
        } else if (data.feature && disabledFeature(data.feature)) {
          return 'errorPage.notFound';
        }
      }
    });

    function disabledFeature(feature) {
      return (!ENV.featuresVisible && ENV.toBeFeatures.indexOf(feature) !== -1);
    }
  }

  angular.module('ncsaas').run(disableCustomerStates);

  disableCustomerStates.$inject = ['$rootScope', '$state', 'currentStateService'];

  function disableCustomerStates($rootScope, $state, currentStateService) {
    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      if (!toState.data) {
        return;
      }

      var workspace = toState.data.workspace;
      if (workspace === 'organization' || workspace === 'project') {
        if (currentStateService.getHasCustomer() === false) {
          event.preventDefault();
        }
      }
    });
  }

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

  function getCurrentUser(usersService) {
    return usersService.getCurrentUser();
  }

  function checkWorkspace(CustomerUtilsService) {
    return CustomerUtilsService.checkWorkspace();
  }

  function getCurrentCustomer(CustomerUtilsService) {
    return CustomerUtilsService.getCurrentCustomer();
  }

  function getStoredCustomer(CustomerUtilsService) {
    return CustomerUtilsService.getStoredCustomer();
  }

  function decorateStates($stateProvider) {
    decorateState($stateProvider, function(state) {
      if (state.data && state.data.auth) {
        state.resolve.currentUser = getCurrentUser;
      }

      if (state.data && state.data.workspace === 'organization') {
        state.resolve.checkWorkspace = checkWorkspace;
        state.resolve.currentCustomer = getCurrentCustomer;
      }

      if (state.data && state.data.workspace === 'project') {
        state.resolve.currentCustomer = getStoredCustomer;
      }
    });
  }

  angular.module('ncsaas').config(decorateStates);

})();

(function() {
  angular.module('ncsaas')
    // urls
    .config(function($stateProvider, $urlRouterProvider, MODE) {
      $urlRouterProvider.when('/', '/dashboard/');
      $urlRouterProvider.otherwise('/login/');

      $stateProvider
        .state('resources', {
          url: '/resources/',
          abstract: true,
          templateUrl: 'views/resource/base.html',
          data: {
            auth: true,
            workspace: 'project',
            sidebarState: 'project.resources',
            pageClass: 'gray-bg'
          }
        })

        .state('resources.details', {
          url: ':resource_type/:uuid',
          templateUrl: 'views/resource/details.html',
          controller: 'ResourceDetailUpdateController as controller'
        })

        .state('payment', {
          url: '/payment/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
          data: {
            bodyClass: 'old',
            auth: true
          }
        })

        .state('payment.approve', {
          url: 'approve/',
          views: {
            'appHeader' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent' : {
              templateUrl: 'views/payment/approve.html',
            }
          },
          data: {
            pageTitle: 'Approve payment'
          }
        })

        .state('payment.cancel', {
          url: 'cancel/',
          views: {
            'appHeader' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent' : {
              templateUrl: 'views/payment/cancel.html',
            }
          },
          data: {
            pageTitle: 'Cancel payment'
          }
        })

        .state('agreement', {
          url: '/agreement/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
          data: {
            auth: true,
            bodyClass: 'old'
          }
        })

        .state('agreement.approve', {
          url: 'agreement/',
          views: {
            'appHeader' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent' : {
              templateUrl: 'views/agreement/approve.html',
            }
          }
        })

        .state('agreement.cancel', {
          url: 'cancel/',
          views: {
            'appHeader' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent' : {
              templateUrl: 'views/agreement/cancel.html',
            }
          },
        })

        .state('errorPage', {
          url: '/error/',
          templateUrl: 'views/partials/base.html',
          abstract: true,
          data: {
            bodyClass: 'old'
          }
        })

        .state('errorPage.notFound', {
          url: '404/',
          views: {
            'appContent': {
              templateUrl: 'views/404.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/site-header.html',
            }
          },
          data: {
            pageTitle: 'Page not found'
          }
        })

        .state('errorPage.limitQuota', {
          url: '403/',
          views: {
            'appContent': {
              templateUrl: 'views/403.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/site-header.html',
            }
          },
          data: {
            pageTitle: 'Quota limit exceeded'
          }
        })

        .state('help', {
          url: '/help/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            pageTitle: 'Help'
          }
        })
        .state('help.list', {
          url: '',
          templateUrl: 'views/help/list.html',
          auth: true,
          noInitialData: true,
        })
        .state('help.details', {
          url: ':name/',
          templateUrl: 'views/help/details.html',
          auth: true,
          noInitialData: true,
        })
        .state('tos', {
          url: '/tos/',
          abstract: true,
          templateUrl: 'views/partials/base-universal.html',
        })
        .state('tos.index', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/tos/index.html',
            },
            'appHeaderOut': {
              templateUrl: MODE.homeHeaderTemplate ? MODE.homeHeaderTemplate : 'views/partials/site-header.html',
            },
            'appHeaderIn': {
              templateUrl: 'views/partials/site-header.html',
            }
          },
          data: {
            bodyClass: 'old',
            pageTitle: 'Terms of service'
          }
        })
        .state('about', {
          url: '/about/',
          abstract: true,
          templateUrl: 'views/partials/base-universal.html',
        })
        .state('about.index', {
          url: '',
          views: {
            'appContent': {
              templateUrl: MODE.aboutPageTemplate ? MODE.aboutPageTemplate : 'views/about/index.html',
            },
            'appHeaderOut': {
              templateUrl: MODE.homeHeaderTemplate ? MODE.homeHeaderTemplate : 'views/partials/site-header.html',
            },
            'appHeaderIn': {
              templateUrl: 'views/partials/site-header.html',
            }
          },
          data: {
            bodyClass: 'old',
            pageTitle: 'About'
          }
        })
        .state('policy', {
          url: '/policy/',
          abstract: true,
          templateUrl: 'views/partials/base-universal.html',
        })
        .state('policy.privacy', {
          url: 'privacy/',
          views: {
            'appContent': {
              templateUrl: 'views/policy/privacy.html',
            },
            'appHeaderOut': {
              templateUrl: MODE.homeHeaderTemplate ? MODE.homeHeaderTemplate : 'views/partials/site-header.html',
            },
            'appHeaderIn': {
              templateUrl: 'views/partials/site-header.html',
            }
          },
          data: {
            bodyClass: 'old',
            pageTitle: 'Privacy policy'
          }
        })
    });

})();

(function() {
  angular.module('ncsaas')
    .config(['ENV', 'CUSTOMENV', 'MODE', overrideBaseSettings]);

  function overrideBaseSettings(ENV, CUSTOMENV, MODE) {
    for (var modeProperty in MODE) {
      if (MODE.hasOwnProperty(modeProperty)) {
        ENV[modeProperty] = MODE[modeProperty];
      }
    }
    for (var property in CUSTOMENV) {
      if (CUSTOMENV.hasOwnProperty(property)) {
        ENV[property] = CUSTOMENV[property];
      }
    }
  }
})();

(function() {
  angular.module('ncsaas').run(checkLanguage);

  checkLanguage.$inject = ['$translate', 'LANGUAGE'];

  function checkLanguage($translate, LANGUAGE) {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.

    function isValid(current) {
      for (var i=0; i<LANGUAGE.CHOICES.length; i++) {
        if (LANGUAGE.CHOICES[i].code == current) {
          return true;
        }
      }
      return false;
    }

    var current = $translate.use();
    if (!isValid(current)) {
      $translate.use(LANGUAGE.DEFAULT);
    }
  }
})();

(function() {
  angular.module('ncsaas')
    .factory('httpInterceptor', [
      '$q', '$location', 'ncUtilsFlash', 'ENV', 'blockUI', '$rootScope', httpInterceptor]);

    function httpInterceptor($q, $location, ncUtilsFlash, ENV, blockUI, $rootScope) {
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
              blockUI.reset();
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
          if (rejection.status === 401) {
            $rootScope.$broadcast('authService:signout');
            $location.path('/login/');
            return $q.reject(rejection);
          } else if (!abortRequests) {
            var message = rejection.status ? (rejection.status + ': ' + rejection.statusText) : 'Connection error';
            if (rejection.data && rejection.data.non_field_errors) {
              message += ' ' + rejection.data.non_field_errors;
            }
            if (rejection.data && rejection.data.detail) {
              message += ' ' + rejection.data.detail;
            }
            if (rejection.config) {
              clearTimeout(timeouts[getKey(rejection.config)]);
              console.error(message, rejection.config);
            }
            blockUI.reset();
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

})();
