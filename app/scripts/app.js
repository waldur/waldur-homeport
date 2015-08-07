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
      'blockUI'
    ])
    // urls
    .config(function($stateProvider, $urlRouterProvider) {
      var initialDataState = 'initialdata.view',
        initialDataStatePath = '/initial-data/';

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
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: 'views/home/home.html',
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
              templateUrl: 'views/partials/site-header.html',
            },
            'appContent@home' : {
              templateUrl: 'views/home/login.html',
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
              templateUrl: 'views/partials/site-header-disabled.html',
            },
            'appContent@initialdata' : {
              templateUrl: 'views/initial-data/initial-data.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
        })
        .state('initialdata.demo', {
          url: 'demo/',
          views: {
            'appHeader@initialdata' : {
              templateUrl: 'views/partials/site-header-initial.html',
            },
            'appContent@initialdata' : {
              templateUrl: 'views/initial-data/initial-data-demo.html',
            }
          },
          resolve: {
            authenticated: authCheck
          }
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
            },
            'eventTypes@dashboard.index': {
              templateUrl: 'views/events/event-types.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('dashboard.eventlog', {
          url: 'events/',
          views: {
            'appHeader@dashboard' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@dashboard' : {
              templateUrl: 'views/dashboard/event-log.html',
            },
            'eventTypes@dashboard.eventlog' : {
              templateUrl: 'views/events/event-types.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('dashboard.alerts', {
          url: 'alerts/',
          views: {
            'appHeader@dashboard' : {
              templateUrl: 'views/partials/app-header.html',
            },
            'appContent@dashboard' : {
              templateUrl: 'views/dashboard/alerts-list.html',
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
          url: '',
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

        .state('projects.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/project/list.html',
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
            'tabResources@projects.details' : {
              templateUrl: 'views/project/tab-resources.html',
            },
            'tabUsers@projects.details' : {
              templateUrl: 'views/project/tab-users.html',
            },
            'eventTypes@projects.details' : {
              templateUrl: 'views/events/event-types.html',
            },
            'tabServices@projects.details' : {
              templateUrl: 'views/project/tab-services.html',
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

        .state('projects.update', {
          url: ':uuid/edit/',
          views: {
            'appContent': {
              templateUrl: 'views/project/update.html',
            },
            'tabEventlog@projects.update' : {
              templateUrl: 'views/project/tab-eventlog.html',
            },
            'tabResources@projects.update' : {
              templateUrl: 'views/project/tab-resources.html',
            },
            'tabUsers@projects.update' : {
              templateUrl: 'views/project/tab-users.html',
            },
            'eventTypes@projects.update' : {
              templateUrl: 'views/events/event-types.html',
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

        .state('services', {
          url: '/services/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('services.list', {
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/service/list.html'
            },
            'listTemplate@services.list' : {
              templateUrl: 'views/service/list-template.html'
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

        .state('services.details', {
          url: ':provider/:uuid/',
          views: {
            'appContent': {
              templateUrl: 'views/service/details.html'
            },
            'tabEventlog@services.details' : {
              templateUrl: 'views/service/tab-eventlog.html',
            },
            'tabResources@services.details' : {
              templateUrl: 'views/service/tab-resources.html',
            },
            'tabProjects@services.details' : {
              templateUrl: 'views/service/tab-projects.html',
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
            'tabProjects@profile.details': {
              templateUrl: 'views/user/tab-projects.html',
            },
            'tabKeys@profile.details': {
              templateUrl: 'views/user/tab-keys.html',
            },
            'eventTypes@profile.details' : {
              templateUrl: 'views/events/event-types.html',
            },
            'detailsTemplate@profile.details' : {
              templateUrl: 'views/user/details-template.html',
            },
            'tabManageUser@profile.details': {
              templateUrl: 'views/profile/tab-manage.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true
        })

        .state('profile.update', {
          url: 'edit/',
          views: {
            'appContent': {
              templateUrl: 'views/profile/update.html',
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
          url: ':uuid/:tab',
          views: {
            'appContent': {
              templateUrl: 'views/customer/details.html',
            },
            'tabResources@organizations.details': {
              templateUrl: 'views/customer/tab-resources.html',
            },
            'tabProjects@organizations.details': {
              templateUrl: 'views/customer/tab-projects.html',
            },
            'tabServices@organizations.details': {
              templateUrl: 'views/customer/tab-services.html',
            },
            'listTemplate@organizations.details' : {
              templateUrl: 'views/service/list-template.html'
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
            'tabProjects@users.details': {
              templateUrl: 'views/user/tab-projects.html',
            },
            'tabKeys@users.details': {
              templateUrl: 'views/user/tab-keys.html',
            },
            'eventTypes@users.details' : {
              templateUrl: 'views/events/event-types.html',
            },
            'detailsTemplate@users.details' : {
              templateUrl: 'views/user/details-template.html',
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
          url: '',
          views: {
            'appContent': {
              templateUrl: 'views/resource/list.html',
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

        .state('resources.create', {
          url: 'add/',
          views: {
            'appContent': {
              templateUrl: 'views/resource/create.html',
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
            'tabBackups@resources.details': {
              templateUrl: 'views/resource/tab-backups.html',
            },
            'backupListContent@resources.details' : {
              templateUrl: 'views/backup/backup-list-content.html',
            },
            'tabs@resources.details': {
              templateUrl: 'views/resource/tabs.html',
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

        .state('resources.update', {
          url: ':resource_type/:uuid/edit/:tab',
          views: {
            'appContent': {
              templateUrl: 'views/resource/update.html',
            },
            'tabBackups@resources.update': {
              templateUrl: 'views/resource/tab-backups.html',
            },
            'tabs@resources.update': {
              templateUrl: 'views/resource/tabs.html',
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
            'backupListContent@backups.list' : {
              templateUrl: 'views/backup/backup-list-content.html',
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
        });

      function authCheck($q, $location, $auth, usersService) {
        var deferred = $q.defer();
        var vm = this;
        if (!$auth.isAuthenticated()) {
          // can't use $state because its will throw recursion error
          $location.path('/login/');
        } else {
          if (vm.self.name !== initialDataState) {
            usersService.getCurrentUser().then(function(response) {
              if (!response.full_name || !response.email) {
                $location.path(initialDataStatePath);
              } else {
                deferred.resolve();
              }
            });
          } else {
            deferred.resolve();
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
      .config(['ENV', 'CUSTOMENV', overrideBaseSettings]);

    function overrideBaseSettings(ENV, CUSTOMENV) {
      for (var property in CUSTOMENV) {
        if (CUSTOMENV.hasOwnProperty(property)) {
          ENV[property] = CUSTOMENV[property];
        }
      }
    }

    angular.module('ncsaas').run(['$translate', 'LANGUAGE',
      function($translate, LANGUAGE) {

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
    .factory('myHttpInterceptor', function($q, Flash) {
      return {
        'responseError': function(rejection) {
          var message = rejection.status ? (rejection.status + ': ' + rejection.statusText) : 'Connection error';
          if (rejection.data && rejection.data.non_field_errors) {
            message += ' ' + rejection.data.non_field_errors;
          }
          Flash.create('danger', message);
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
