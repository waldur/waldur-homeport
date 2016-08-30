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
      'ui.bootstrap'
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
          },
          data: {
            specialClass: 'landing',
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
            specialClass: 'old'
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
            specialClass: 'old'
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
          },
          data: {
            specialClass: 'old'
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
          },
          data: {
            specialClass: 'old'
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
            specialClass: 'old'
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
          },
          data: {
            specialClass: 'old'
          }
        })

        .state('support.create', {
          url: 'add/:type',
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
          },
          data: {
            specialClass: 'old'
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
          },
          data: {
            specialClass: 'old'
          }
        })

        .state('dashboard', {
          url: '/dashboard/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('dashboard.index', {
          reloadOnSearch: false,
          url: '?tab',
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
            'resourcesTab@dashboard.index': {
              templateUrl: 'views/dashboard/resources-tab.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          data: {
            specialClass: 'old'
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
          auth: true,
          data: {
            specialClass: 'old'
          }
        })

        .state('projects', {
          url: '/projects/',
          abstract: true,
          templateUrl: 'views/project/base.html',
          data: {
            specialClass: 'white-bg'
          }
        })

        .state('projects.details', {
          url: ':uuid/',
          abstract: true,
          template: '<div ui-view></div>',
          resolve: {
            currentProject: function(
              $stateParams, $state, $rootScope, projectsService, currentStateService) {
              if (!$stateParams.uuid) {
                return currentStateService.getProject();
              }
              return projectsService.$get($stateParams.uuid).then(function(project) {
                currentStateService.setProject(project);
                $rootScope.$broadcast('currentProjectUpdated');
                return project;
              }, function() {
                $state.go('errorPage.notFound');
              });
            }
          }
        })

        .state('projects.details.events', {
          url: 'events/',
          templateUrl: 'views/project/tab-eventlog.html',
          controller: 'ProjectEventTabController',
          controllerAs: 'EventList',
          data: {
            pageTitle: 'Events'
          }
        })

        .state('projects.details.alerts', {
          url: 'alerts/',
          templateUrl: 'views/resource/tab-alerts.html',
          controller: 'ProjectAlertTabController',
          controllerAs: 'Ctrl',
          data: {
            pageTitle: 'Alerts'
          }
        })

        .state('projects.details.virtual-machines', {
          url: 'virtual-machines/',
          templateUrl: 'views/project/tab-resources.html',
          controller: 'ProjectResourcesTabController',
          controllerAs: 'ProjectResourcesTab',
          data: {
            pageTitle: 'Virtual machines'
          }
        })

        .state('projects.details.applications', {
          url: 'applications/',
          templateUrl: 'views/resource/tab-applications.html',
          controller: 'ProjectApplicationsTabController',
          controllerAs: 'ApplicationsList',
          data: {
            pageTitle: 'Applications'
          }
        })

        .state('projects.details.private-clouds', {
          url: 'private-clouds/',
          templateUrl: 'views/resource/tab-private-clouds.html',
          controller: 'ProjectPrivateCloudsTabController',
          controllerAs: 'PrivateClouds',
          data: {
            pageTitle: 'Private clouds'
          }
        })

        .state('projects.details.support', {
          url: 'support/',
          templateUrl: 'views/project/tab-support.html',
          controller: 'ProjectSupportTabController',
          controllerAs: 'ProjectSupportTab',
          data: {
            pageTitle: 'Premium support'
          }
        })

        .state('projects.details.delete', {
          url: 'delete/',
          templateUrl: 'views/project/tab-delete.html',
          controller: 'ProjectDeleteTabController',
          controllerAs: 'delController',
          data: {
            pageTitle: 'Manage'
          }
        })

        .state('projects.details.import', {
          url: 'import/?service_type&service_uuid',
          templateUrl: 'views/import/import.html',
          data: {
            pageTitle: 'Import resources from provider'
          }
        })

        .state('profile', {
          url: '/profile/',
          abstract: true,
          templateUrl: 'views/partials/base.html',
        })

        .state('profile.details', {
          reloadOnSearch: false,
          url: '?tab',
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
            },
            'tabManage@profile.details' : {
              templateUrl: 'views/user/tab-manage.html'
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            specialClass: 'old'
          }
        })

        .state('organizations', {
          url: '/organizations/',
          abstract: true,
          templateUrl: 'views/customer/base.html',
          data: {
            specialClass: 'white-bg'
          }
        })

        .state('organizations.list', {
          url: '',
          templateUrl: 'views/customer/list.html',
          resolve: {
            authenticated: authCheck
          },
          data: {
            pageTitle: 'Organizations'
          },
          auth: true
        })

        .state('organizations.details', {
          url: ':uuid/',
          abstract: true,
          template: '<div ui-view></div>',
          resolve: {
            currentCustomer: function(
              $stateParams, $state, $rootScope, customersService, currentStateService) {
              if (!$stateParams.uuid) {
                return currentStateService.getCustomer();
              }
              return customersService.$get($stateParams.uuid).then(function(customer) {
                currentStateService.setCustomer(customer);
                $rootScope.$broadcast('currentCustomerUpdated');
                return customer;
              }, function() {
                $state.go('errorPage.notFound');
              });
            }
          }
        })

        .state('organizations.details.alerts', {
          url: 'alerts/',
          templateUrl: 'views/customer/tab-alerts.html',
          controller: 'CustomerAlertsListController',
          controllerAs: 'Ctrl',
          data: {
            pageTitle: 'Alerts'
          }
        })

        .state('organizations.details.events', {
          url: 'events/',
          templateUrl: 'views/customer/tab-eventlog.html',
          controller: 'CustomerEventTabController',
          controllerAs: 'EventList',
          data: {
            pageTitle: 'Events'
          }
        })

        .state('organizations.details.projects', {
          url: 'projects/',
          templateUrl: 'views/customer/tab-projects.html',
          controller: 'CustomerProjectTabController',
          controllerAs: 'CustomerProjectTab',
          data: {
            pageTitle: 'Projects'
          }
        })

        .state('organizations.details.projects-create', {
          url: 'add/',
          templateUrl: 'views/project/create.html',
          controller: 'ProjectAddController',
          controllerAs: 'ProjectAdd',
          data: {
            pageTitle: 'Create project'
          }
        })

        .state('organizations.details.team', {
          url: 'team/',
          templateUrl: 'views/customer/tab-team.html',
          controller: 'CustomerTeamTabController',
          controllerAs: 'TeamList',
          data: {
            pageTitle: 'Team'
          }
        })

        .state('organizations.details.providers', {
          url: 'providers/',
          templateUrl: 'views/customer/tab-services.html',
          controller: 'CustomerServiceTabController',
          controllerAs: 'ServiceList',
          data: {
            pageTitle: 'Providers'
          }
        })

        .state('organizations.details.providers-create', {
          url: 'add-provider/',
          templateUrl: 'views/service/create.html',
          controller: 'ServiceAddController',
          controllerAs: 'ServiceAdd',
          data: {
            pageTitle: 'Create provider'
          }
        })

        .state('organizations.details.virtual-machines', {
          url: 'virtual-machines/',
          templateUrl: 'views/customer/tab-resources.html',
          controller: 'CustomerResourcesTabController',
          controllerAs: 'ResourceList',
          data: {
            pageTitle: 'Virtual machines'
          }
        })

        .state('organizations.details.applications', {
          url: 'applications/',
          templateUrl: 'views/customer/tab-applications.html',
          controller: 'CustomerApplicationsTabController',
          controllerAs: 'ResourceList',
          data: {
            pageTitle: 'Applications'
          }
        })

        .state('organizations.details.private-clouds', {
          url: 'private-clouds/',
          templateUrl: 'views/customer/tab-private-clouds.html',
          controller: 'CustomerPrivateCloudTabController',
          controllerAs: 'PrivateCloud',
          data: {
            pageTitle: 'Private clouds'
          }
        })

        .state('organizations.details.billing', {
          url: 'billing/',
          templateUrl: 'views/customer/tab-billing.html',
          data: {
            pageTitle: 'Billing'
          }
        })

        .state('organizations.details.sizing', {
          url: 'sizing/',
          templateUrl: 'views/customer/tab-sizing.html',
          data: {
            pageTitle: 'Sizing'
          }
        })

        .state('organizations.details.delete', {
          url: 'delete/',
          templateUrl: 'views/customer/tab-delete.html',
          controller: 'CustomerDeleteTabController',
          controllerAs: 'DeleteController',
          data: {
            pageTitle: 'Delete'
          }
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
          auth: true,
          data: {
            specialClass: 'old'
          }
        })

        .state('users.details', {
          reloadOnSearch: false,
          url: ':uuid/?tab',
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
          auth: true,
          data: {
            specialClass: 'old'
          }
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
            'tabApplications@resources.list' : {
              templateUrl: 'views/resource/tab-applications.html',
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
          auth: true,
          data: {
            specialClass: 'old'
          }
        })

        .state('resources.details', {
          url: ':resource_type/:uuid/?tab',
          views: {
            'appContent': {
              templateUrl: 'views/resource/details.html',
            },
            'tabDetails@resources.details': {
              templateUrl: 'views/resource/tab-details.html',
            },
            'tabAlerts@resources.details': {
              templateUrl: 'views/resource/tab-alerts.html',
            },
            'tabGraphs@resources.details': {
              templateUrl: 'views/resource/tab-graphs.html',
            },
            'tabSLA@resources.details': {
              templateUrl: 'views/resource/tab-sla.html',
            },
            'appHeader': {
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            specialClass: 'old'
          }
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
            specialClass: 'old'
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
            specialClass: 'old'
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
            specialClass: 'old'
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
            specialClass: 'old'
          }
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
          auth: true,
          data: {
            specialClass: 'old'
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
              templateUrl: 'views/partials/app-header.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          data: {
            specialClass: 'old'
          }
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
          auth: true,
          data: {
            specialClass: 'old'
          }
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
          noInitialData: true,
          data: {
            specialClass: 'old'
          }
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
            },
            'alertsList@help.details': {
              templateUrl: 'views/help/alerts-events-list.html',
            },
            'eventsList@help.details': {
              templateUrl: 'views/help/alerts-events-list.html',
            }
          },
          resolve: {
            authenticated: authCheck
          },
          auth: true,
          noInitialData: true,
          data: {
            specialClass: 'old'
          }
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
          },
          data: {
            specialClass: 'old'
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
              templateUrl: 'views/partials/app-header.html',
            }
          },
          data: {
            specialClass: 'old'
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
              templateUrl: 'views/partials/app-header.html',
            }
          },
          data: {
            specialClass: 'old'
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
