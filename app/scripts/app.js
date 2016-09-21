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
          return authCheck();
        } else if (data.anonymous && $auth.isAuthenticated()) {
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

  angular.module('ncsaas').config(attachAuthResolve);

  attachAuthResolve.$inject = ['$stateProvider'];

  function attachAuthResolve($stateProvider) {
    $stateProvider.decorator('views', function(state, parent) {
      var result = {}, views = parent(state);

      angular.forEach(views, function(config, name) {
        if (config.data && config.data.auth) {
          config.resolve = config.resolve || {};
          config.resolve.authentication = authentication;

          authentication.$inject = ['usersService'];
          function authentication(usersService) {
            return usersService.getCurrentUser();
          }
        }
        result[name] = config;
      });

      return result;
    });
  }

})();

(function() {
  angular.module('ncsaas')
    // urls
    .config(function($stateProvider, $urlRouterProvider, MODE) {
      var initialDataState = 'initialdata.view',
        initialDataStatePath = '/initial-data/';

      $urlRouterProvider.when('/', '/dashboard/');
      $urlRouterProvider.otherwise('/login/');

      $stateProvider
        .state('home', {
          url: '/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('home.home', {
          url: '',
          views: {
            'appHeader@home' : {
              templateUrl: MODE.homeHeaderTemplate ? MODE.homeHeaderTemplate : 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: MODE.homeTemplate ? MODE.homeTemplate : 'views/home/home.html',
            }
          },
          data: {
            bodyClass: 'landing',
            disabled: true
          },
        })

        .state('login', {
          url: '/login/',
          templateUrl: 'views/home/login-box.html',
          data: {
            isSignupFormVisible: false,
            bodyClass: 'old',
            anonymous: true,
          }
        })

        .state('register', {
          url: '/register/',
          templateUrl: 'views/home/login-box.html',
          data: {
            isSignupFormVisible: true,
            bodyClass: 'old',
            anonymous: true
          }
        })

        .state('home.activate', {
          url: 'activate/:user_uuid/:token/',
          views: {
            'appHeader@home' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: 'views/home/activate.html',
            }
          },
          data: {
            anonymous: true
          }
        })

        .state('home.login_complete', {
          url: 'login_complete/:token/',
          views: {
            'appHeader@home' : {
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: 'views/home/login_complete.html',
            }
          },
          data: {
            anonymous: true
          }
        })

        .state('initialdata', {
          url: initialDataStatePath,
          templateUrl: 'views/partials/base.html',
          abstract: true
        })

        .state(initialDataState, {
          url: '',
          views: {
            'appHeader@initialdata' : {
              templateUrl: 'views/partials/site-header-initial.html',
            },
            'appContent@initialdata' : {
              templateUrl: MODE.initialDataTemplate ? MODE.initialDataTemplate : 'views/initial-data/initial-data.html',
            }
          },
          noInitialData: true,
          data: {
            auth: true,
            bodyClass: 'old'
          }
        })

        .state('support', {
          url: '/support/',
          templateUrl: 'views/customer/base.html',
          abstract: true,
          data: {
            auth: true
          }
        })

        .state('support.list', {
          url: '',
          templateUrl: 'views/support/list.html',
          data: {
            pageTitle: 'Support'
          }
        })

        .state('support.create', {
          url: 'add/:type',
          templateUrl: 'views/support/create.html',
        })

        .state('dashboard', {
          url: '/dashboard/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            pageTitle: 'Dashboard',
            auth: true
          },
        })

        .state('dashboard.index', {
          url: '?tab',
          templateUrl: 'views/dashboard/index.html',
        })

        .state('resources', {
          url: '/resources/',
          abstract: true,
          templateUrl: 'views/resource/base.html',
          data: {
            auth: true
          }
        })

        .state('resources.details', {
          url: ':resource_type/:uuid',
          templateUrl: 'views/resource/details.html',
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
        });
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

})();
