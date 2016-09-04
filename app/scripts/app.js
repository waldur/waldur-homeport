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
    // urls
    .config(function($stateProvider, $urlRouterProvider, blockUIConfig, MODE) {
      var initialDataState = 'initialdata.view',
        initialDataStatePath = '/initial-data/';

      blockUIConfig.autoBlock = false;

      $urlRouterProvider.otherwise('/login/');

      $stateProvider
        .state('home', {
          url: '/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
          resolve: {
            authenticated: notLoggedCheck
          }
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
          resolve: {
            authenticated: authCheck
          },
          data: {
            bodyClass: 'landing',
          }
        })

        .state('login', {
          url: '/login/',
          templateUrl: MODE.homeLoginTemplate ? MODE.homeLoginTemplate : 'views/home/login.html',
          resolve: {
            authenticated: notLoggedCheck
          },
          data: {
            isSignupFormVisible: false,
            bodyClass: 'old'
          }
        })

        .state('register', {
          url: '/register/',
          templateUrl: MODE.homeLoginTemplate ? MODE.homeLoginTemplate : 'views/home/login.html',
          resolve: {
            authenticated: notLoggedCheck
          },
          data: {
            isSignupFormVisible: true,
            bodyClass: 'old'
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
          resolve: {
            authenticated: notLoggedCheck
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
          resolve: {
            authenticated: notLoggedCheck
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
          resolve: {
            authenticated: authCheck
          },
          noInitialData: true,
          data: {
            bodyClass: 'old'
          }
        })

        .state('support', {
          url: '/support/',
          templateUrl: 'views/customer/base.html',
          abstract: true,
          data: {
            bodyClass: 'white-bg'
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
            bodyClass: 'white-bg',
            pageTitle: 'Dashboard'
          }
        })

        .state('dashboard.index', {
          reloadOnSearch: false,
          url: '?tab',
          templateUrl: 'views/dashboard/index.html',
        })

        .state('appstore', {
          url: '/appstore/',
          abstract: true,
          templateUrl: 'views/project/base.html',
        })

        .state('appstore.store', {
          url: ':category',
          templateUrl: 'views/appstore/store.html',
          data: {
            bodyClass: 'white-bg',
            pageTitle: 'Marketplace'
          }
        })

        .state('services', {
          url: '/services/',
          abstract: true,
          templateUrl: 'views/customer/base.html'
        })

        .state('services.create', {
          url: 'add/',
          templateUrl: 'views/service/create.html',
          controller: 'ServiceAddController',
          controllerAs: 'ServiceAdd',
          data: {
            bodyClass: 'white-bg',
            pageTitle: 'Create provider'
          }
        })

        .state('resources', {
          url: '/resources/',
          abstract: true,
          templateUrl: 'views/resource/base.html',
          data: {
            bodyClass: 'white-bg'
          }
        })

        .state('resources.details', {
          url: ':resource_type/:uuid/?tab',
          templateUrl: 'views/resource/details.html',
        })

        .state('payment', {
          url: '/payment/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
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
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            bodyClass: 'old'
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
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            bodyClass: 'old'
          }
        })

        .state('agreement', {
          url: '/agreement/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
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
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            bodyClass: 'old'
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
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            bodyClass: 'old'
          }
        })

        .state('errorPage', {
          url: '/error/',
          templateUrl: 'views/partials/base.html',
          abstract: true,
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
            bodyClass: 'old'
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
            bodyClass: 'old'
          }
        })

        .state('help', {
          url: '/help/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            bodyClass: 'white-bg',
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
            bodyClass: 'old'
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
            bodyClass: 'old'
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
            bodyClass: 'old'
          }
        });

      function authCheck($q, $location, $auth, usersService, ENV) {
        var deferred = $q.defer();
        var vm = this;
        if (!$auth.isAuthenticated()) {
          // can't use $state because its will throw recursion error
          $location.path('/login/');
        } else {
          if (!ENV.featuresVisible && (ENV.toBeFeatures.indexOf(vm.url.prefix.replace(/\//g, '')) !== -1
            || ENV.toBeFeatures.indexOf(vm.url.source.replace(/\//g, '')) !== -1)) {
            $location.path('/error/404/');
          } else {
            if (!vm.self.noInitialData) {
              usersService.getCurrentUser().then(function(response) {
                if (!response.email) {
                  $location.path(initialDataStatePath);
                } else {
                  deferred.resolve();
                }
              });
            } else {
              deferred.resolve();
            }
          }
        }

        return deferred.promise;
      }

      function notLoggedCheck($q, $location, $auth) {
        var deferred = $q.defer();

        if ($auth.isAuthenticated()) {
          // can't use $state because its will throw recursion error
          $location.path('/dashboard/');
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      }
    });

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

    angular.module('ncsaas').run(['$translate', 'LANGUAGE', '$rootScope', '$state', 'ENV',
      function($translate, LANGUAGE, $rootScope, $state, ENV) {

        $rootScope.$state = $state;

        if (ENV.modePageTitle) {
          $rootScope.pageTitle = ENV.modePageTitle;
        }

        // Check if current language is listed in choices
        function isValid(current) {
          for (var i=0; i<LANGUAGE.CHOICES.length; i++) {
            if (LANGUAGE.CHOICES[i].code == current) {
              return true;
            }
          }
          return false;
        }

        // Switch to default language if current choice is invalid
        var current = $translate.use();
        if (!isValid(current)) {
          $translate.use(LANGUAGE.DEFAULT);
        }
      }])
  })();
})();

(function() {
  angular.module('ncsaas')
    .factory('httpInterceptor', [
      '$q', 'ncUtilsFlash', 'ENV', 'blockUI', '$rootScope', httpInterceptor]);

    function httpInterceptor($q, ncUtilsFlash, ENV, blockUI, $rootScope) {
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
          if (!abortRequests) {
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
