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
      'angucomplete-alt',
      'angularMoment',
      'ngAnimate',
      'pascalprecht.translate',
      'angular-cron-jobs',
      'flash',
      'tc.chartjs',
      'angulartics',
      'angulartics.google.analytics',
      'ngFileUpload',
      'xeditable',
      'blockUI',
      'ngSanitize'
    ])
    // urls
    .config(function($stateProvider, $urlRouterProvider, blockUIConfig, MODE) {
      var initialDataState = 'initialdata.view',
        initialDataStatePath = '/initial-data/';

      blockUIConfig.autoBlock = false;

      $urlRouterProvider.otherwise('/');

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
            authenticated: notLoggedCheck
          }
        })

        .state('home.login', {
          url: 'login/',
          controller: 'AuthController',
          views: {
            'appHeader@home' : {
              templateUrl: MODE.homeHeaderTemplate ? MODE.homeHeaderTemplate : 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: MODE.homeLoginTemplate ? MODE.homeLoginTemplate : 'views/home/login.html',
            }
          },
          resolve: {
            authenticated: notLoggedCheck
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
          noInitialData: true
        })

        .state('support', {
          url: '/support/',
          templateUrl: 'views/partials/base.html',
          abstract: true
        })

        .state('support.list', {
          url: '',
          views: {
            'appHeader@support' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@support' : {
              templateUrl: 'views/support/list.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
        })

        .state('support.create', {
          url: 'add/',
          views: {
            'appHeader' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent' : {
              templateUrl: 'views/support/create.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
        })

        .state('import', {
          url: '/import/',
          templateUrl: 'views/partials/base.html',
          abstract: true
        })

        .state('import.import', {
          url: '',
          views: {
            'appHeader@import' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@import' : {
              templateUrl: 'views/import/import.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
        })

        .state('compare', {
          url: '/compare/',
          templateUrl: 'views/partials/base.html',
          abstract: true
        })

        .state('compare.vms', {
          url: '',
          views: {
            'appHeader@compare' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@compare' : {
              templateUrl: 'views/compare/table.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
        })

        .state('dashboard', {
          url: '/dashboard/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('dashboard.index', {
          url: ':tab',
          views: {
            'appHeader@dashboard': {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@dashboard': {
              templateUrl: 'views/dashboard/index.html',
            },
            'activityTab@dashboard.index': {
              templateUrl: 'views/dashboard/activity-tab.html',
            },
            'costTab@dashboard.index': {
              templateUrl: 'views/dashboard/cost-tab.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('appstore', {
          url: '/appstore/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('appstore.store', {
          url: ':category',
          views: {
            'appContent': {
              templateUrl: 'views/appstore/store.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('projects', {
          url: '/projects/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('projects.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/project/create.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('projects.details', {
          url: ':uuid/:tab',
          views: {
            'appContent': {
              templateUrl: 'views/project/details.html',
            },
            'tabEventlog@projects.details' : {
              templateUrl: 'views/project/tab-eventlog.html',
            },
            'tabAlerts@projects.details' : {
              templateUrl: 'views/project/tab-alerts.html',
            },
            'tabResources@projects.details' : {
              templateUrl: 'views/project/tab-resources.html',
            },
            'tabUsers@projects.details' : {
              templateUrl: 'views/project/tab-users.html',
            },
            'tabProviders@projects.details' : {
              templateUrl: 'views/resource/tab-providers.html',
            },
            'tabApplications@projects.details' : {
              templateUrl: 'views/resource/tab-applications.html',
            },
            'tabBackups@projects.details' : {
              templateUrl: 'views/resource/tab-backups.html',
            },
            'tabPremiumSupport@projects.details': {
              templateUrl: 'views/project/tab-support.html',
            },
            'tabDelete@projects.details': {
              templateUrl: 'views/project/tab-delete.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            },
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('services', {
          url: '/services/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('services.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/service/create.html'
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html'
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('profile', {
          url: '/profile/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('profile.details', {
          url: ':tab',
          views: {
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent': {
              templateUrl: 'views/profile/details.html',
            },
            'tabEventlog@profile.details': {
              templateUrl: 'views/user/tab-eventlog.html',
            },
            'tabKeys@profile.details': {
              templateUrl: 'views/user/tab-keys.html',
            },
            'detailsTemplate@profile.details' : {
              templateUrl: 'views/user/details-template.html',
            },
            'tabNotifications@profile.details' : {
              templateUrl: 'views/user/tab-notifications.html'
            },
            'tabPassword@profile.details' : {
              templateUrl: 'views/user/tab-password.html'
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('profile.hook-create', {
          url: 'hooks/create/',
          views: {
            'appContent': {
              templateUrl: 'views/profile/hook-create.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('profile.hook-details', {
          url: 'hooks/:type/:uuid/',
          views: {
            'appContent': {
              templateUrl: 'views/profile/hook-update.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('organizations', {
          url: '/organizations/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('organizations.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/customer/list.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('organizations.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/customer/create.html'
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html'
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('organizations.details', {
          url: ':uuid/:tab-:providerUuid-:providerType',
          views: {
            'appContent': {
              templateUrl: 'views/customer/details.html',
            },
            'tabEventlog@organizations.details': {
              templateUrl: 'views/customer/tab-eventlog.html',
            },
            'tabResources@organizations.details': {
              templateUrl: 'views/customer/tab-resources.html',
            },
            'tabApplications@organizations.details' : {
              templateUrl: 'views/customer/tab-applications.html',
            },
            'tabProjects@organizations.details': {
              templateUrl: 'views/customer/tab-projects.html',
            },
            'tabServices@organizations.details': {
              templateUrl: 'views/customer/tab-services.html',
            },
            'tabAlerts@organizations.details': {
              templateUrl: 'views/customer/tab-alerts.html',
            },
            'tabDelete@organizations.details': {
              templateUrl: 'views/customer/tab-delete.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('organizations.plans', {
          url: ':uuid/plans/',
          views: {
            'appContent': {
              templateUrl: 'views/customer/plans.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('users', {
          url: '/users/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('users.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/user/list.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('users.details', {
          url: ':uuid/',
          views: {
            'appContent': {
              templateUrl: 'views/user/details.html',
            },
            'tabEventlog@users.details': {
              templateUrl: 'views/user/tab-eventlog.html',
            },
            'tabKeys@users.details': {
              templateUrl: 'views/user/tab-keys.html',
            },
            'detailsTemplate@users.details' : {
              templateUrl: 'views/user/details-template.html',
            },
            'tabNotifications@users.details' : {
              templateUrl: 'views/user/tab-notifications.html'
            },
            'tabPassword@users.details' : {
              templateUrl: 'views/user/tab-password.html'
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('resources', {
          url: '/resources/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
          resolve: {
            authenticated: authCheck
          }
        })

        .state('resources.list', {
          url: ':tab',
          views: {
            'appContent': {
              templateUrl: 'views/project/details.html',
            },
            'tabEventlog@resources.list' : {
              templateUrl: 'views/project/tab-eventlog.html',
            },
            'tabAlerts@resources.list': {
              templateUrl: 'views/project/tab-alerts.html',
            },
            'tabResources@resources.list' : {
              templateUrl: 'views/project/tab-resources.html',
            },
            'tabUsers@resources.list' : {
              templateUrl: 'views/project/tab-users.html',
            },
            'tabApplications@resources.list' : {
              templateUrl: 'views/resource/tab-applications.html',
            },
            'tabBackups@resources.list' : {
              templateUrl: 'views/resource/tab-backups.html',
            },
            'tabProviders@resources.list' : {
              templateUrl: 'views/resource/tab-providers.html',
            },
            'tabPremiumSupport@resources.list': {
              templateUrl: 'views/project/tab-support.html',
            },
            'tabDelete@resources.list': {
              templateUrl: 'views/project/tab-delete.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('resources.details', {
          url: ':resource_type/:uuid/:tab',
          views: {
            'appContent': {
              templateUrl: 'views/resource/details.html',
            },
            'tabDetails@resources.details': {
              templateUrl: 'views/resource/tab-details.html',
            },
            'tabBackups@resources.details': {
              templateUrl: 'views/resource/tab-backups.html',
            },
            'tabAlerts@resources.details': {
              templateUrl: 'views/resource/tab-alerts.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('payment', {
          url: '/payment/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('payment.checkout', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/payment/checkout.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('payment.success', {
          url: 'success/',
          views: {
            'appContent': {
              templateUrl: 'views/payment/success.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('payment.mock', {
          url: ':uuid/execute/',
          views: {
            'appContent': {
              templateUrl: 'views/payment/mock.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('keys', {
          url: '/keys/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('keys.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/keys/create.html'
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html'
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
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
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('errorPage.limitQuota', {
          url: '403/',
          views: {
            'appContent': {
              templateUrl: 'views/403.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('backups', {
          url: '/backups/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('backups.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/backup/list.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('backups.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/backup/create.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('backup-schedules', {
          url: '/backup-schedules/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
          resolve: {
            authenticated: authCheck
          }
        })

        .state('backup-schedules.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/backup-schedules/create.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })
        .state('statistics', {
          url: '/statistics/',
          abstract: true,
          templateUrl: 'views/partials/base.html'
        })
        .state('statistics.projects-statistic', {
          url: 'projects-statistic/',
          views: {
            'appContent': {
              templateUrl: 'views/statistic/projects-statistic.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })
        .state('backups.restore', {
          url: ':uuid/restore/',
          views: {
            'appContent': {
              templateUrl: 'views/backup/restore.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })
        .state('help', {
          url: '/help/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })
        .state('help.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/help/list.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          noInitialData: true
        })
        .state('help.details', {
          url: ':name/',
          views: {
            'appContent': {
              templateUrl: 'views/help/details.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            },
            'sshKeys@help.details': {
              templateUrl: 'views/help/ssh-keys.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          noInitialData: true
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
              templateUrl: 'views/partials/app-header.html',
            }
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

    angular.module('ncsaas').run(['$translate', 'LANGUAGE', '$rootScope', 'ENV',
      function($translate, LANGUAGE, $rootScope, ENV) {

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
    .factory('myHttpInterceptor', function($q, ncUtilsFlash, ENV, blockUI) {
      var timeouts = {};
      function getKey(config) {
        return config.url + config.method + JSON.stringify(config.params);
      }
      return {
        'request': function(config) {
          var deferred = $q.defer();
          deferred.resolve(config);
          if (config.url) {
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
          var deferred = $q.defer();
          deferred.resolve(response);
          if (response.config) {
            clearTimeout(timeouts[getKey(response.config)]);
          }
          return response;
        },
        'responseError': function(rejection) {
          var message = rejection.status ? (rejection.status + ': ' + rejection.statusText) : 'Connection error';
          if (rejection.data && rejection.data.non_field_errors) {
            message += ' ' + rejection.data.non_field_errors;
          }
          if (rejection.config) {
            clearTimeout(timeouts[getKey(rejection.config)]);
            console.error(message, rejection.config);
          }
          blockUI.reset();
          ncUtilsFlash.error(message);
          return $q.reject(rejection);
        }
      };
    });

  angular.module('ncsaas')
    .config(['$httpProvider', 'blockUIConfig', errorsHandler]);

  function errorsHandler($httpProvider, blockUIConfig) {
    blockUIConfig.delay = 500;
    $httpProvider.interceptors.push('myHttpInterceptor');

    blockUIConfig.requestFilter = function(config) {
      if(config.hasOwnProperty('params') && config.params.hasOwnProperty('DONTBLOCK')) {
        delete config.params.DONTBLOCK;
        return false;
      }
    };
  }
})();
