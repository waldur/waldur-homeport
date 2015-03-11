'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'satellizer',
    'ui.router',
    'ngCookies',
    'ngResource',
    'duScroll'])
  // urls
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
      })

      .state('login', {
        url: '/login/',
        templateUrl: 'views/login.html',
        controller: 'AuthController'
      })

      .state('initialdata', {
        url: '/initial-data/',
        templateUrl: 'views/initial-data.html',
      })

      .state('dashboard', {
        url: '/dashboard/',
        templateUrl: 'views/dashboard.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('projects', {
        url: '/projects/',
        templateUrl: 'views/projects.html',
        auth: true
      })

      .state('projects-add', {
        url: '/projects/add/',
        templateUrl: 'views/add-project.html',
      })

      .state('project', {
        url: '/projects/:uuid/',
        templateUrl: 'views/project.html',
      })

      .state('project-edit', {
        url: '/projects/:uuid/edit/',
        templateUrl: 'views/project-edit.html',
      })

      .state('services', {
        url: '/services/',
        templateUrl: 'views/services.html',
        auth: true
      })

      .state('profile', {
        url: '/profile/',
        templateUrl: 'views/profile.html',
      })

      .state('customers', {
        url: '/customers/',
        abstract: true,
        templateUrl: 'views/customer/base.html',
      })

      .state('customers.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/customer/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customers.details', {
        url: '/:uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/details.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customers.edit', {
        url: '/:uuid/edit/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/update.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customer-plans', {
        url: '/customers/:uuid/plans/',
        templateUrl: 'views/customer-plans.html',
      })

      .state('users', {
        url: '/users/',
        abstract: true,
        templateUrl: 'views/user/base.html'
      })

      .state('users.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/user/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('users.details', {
        url: '/:uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/user/details.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
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
        templateUrl: 'views/resource/base.html',
      })

      .state('resources.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/resource/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('resources.add', {
        url: '/resources/add/',
        views: {
          'appContent': {
            templateUrl: 'views/resource/create.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
      })

      .state('payment', {
        url: '/payment/',
        templateUrl: 'views/payment-start.html',
      })

      .state('payment-finish', {
        url: '/payment/finish/',
        templateUrl: 'views/payment-finish.html',
      });
    function authCheck($q, $location, $auth) {
      var deferred = $q.defer();

      if (!$auth.isAuthenticated()) {
        $location.path('/login/');
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

})();
