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
    'ngLoadingSpinner',
    'ngAnimate',
    'pascalprecht.translate',
    'flash'])
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

      .state('support', {
        url: '/support/',
        templateUrl: 'views/partials/base.html',
        abstract: true
      })

      .state('support.tickets', {
        url: '',
        views: {
          'appHeader@support' : {
            templateUrl: 'views/partials/app-header.html',
          },
          'appContent@support' : {
            templateUrl: 'views/support/tickets.html',
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('support.create', {
        url: 'add/',
        views: {
          'appHeader@support' : {
            templateUrl: 'views/partials/app-header.html',
          },
          'appContent@support' : {
            templateUrl: 'views/support/create.html',
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

      .state('dashboard.eventlog', {
        url: '',
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
        url: ':uuid/',
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
        url: '',
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

      .state('customers', {
        url: '/customers/',
        abstract: true,
        templateUrl: 'views/partials/base.html',
      })

      .state('customers.list', {
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


      .state('customers.create', {
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

      .state('customers.details', {
        url: ':uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/details.html',
          },
          'tabResources@customers.details': {
            templateUrl: 'views/customer/tab-resources.html',
          },
          'tabProjects@customers.details': {
            templateUrl: 'views/customer/tab-projects.html',
          },
          'tabServices@customers.details': {
            templateUrl: 'views/customer/tab-services.html',
          },
          'listTemplate@customers.details' : {
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

      .state('customers.edit', {
        url: ':uuid/edit/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/update.html',
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

      .state('customers.plans', {
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
        url: '/users/:uuid/',
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

      .state('pageNotFound', {
        url: '/error/404/',
        templateUrl: 'views/404.html',
        auth: false
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
