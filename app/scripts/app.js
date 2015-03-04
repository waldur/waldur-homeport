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
        templateUrl: 'views/customers.html',
      })

      .state('customer', {
        url: '/customers/:uuid/',
        templateUrl: 'views/customer.html',
      })

      .state('customer-edit', {
        url: '/customers/:uuid/edit/',
        templateUrl: 'views/customer-edit.html',
      })

      .state('customer-plans', {
        url: '/customers/:uuid/plans/',
        templateUrl: 'views/customer-plans.html',
      })

      .state('users', {
        url: '/users/',
        templateUrl: 'views/users.html',
        auth: true,
        resolve: {
          authenticated: authCheck
        }
      })

      .state('user', {
        url: '/users/:uuid/',
        templateUrl: 'views/user.html',
      })

      .state('resources', {
        url: '/resources/',
        templateUrl: 'views/resources.html',
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('resource-add', {
        url: '/resources/add/',
        templateUrl: 'views/add-resource.html',
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
