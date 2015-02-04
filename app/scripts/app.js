'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'satellizer',
    'ngRoute',
    'ngCookies',
    'ngResource',])
  // urls
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })

      .when('/login/', {
        templateUrl: 'views/login.html',
        controller: 'AuthController'
      })

      .when('/initial-data/', {
        templateUrl: 'views/initial-data.html',
      })

      .when('/dashboard/', {
        templateUrl: 'views/dashboard.html',
      })

      .when('/projects/', {
        templateUrl: 'views/projects.html',
      })

      .when('/projects/add/', {
        templateUrl: 'views/add-project.html',
      })

      .when('/projects/:uuid/', {
        templateUrl: 'views/project.html',
      })

      .when('/projects/:uuid/edit/', {
        templateUrl: 'views/project-edit.html',
      })

      .when('/profile/', {
        templateUrl: 'views/profile.html',
      })

      .when('/customers/:uuid/', {
        templateUrl: 'views/customer.html',
      })

      .when('/users/', {
        templateUrl: 'views/users.html',
      })

      .when('/users/:uuid/', {
        templateUrl: 'views/user.html',
      })

      .otherwise({
        redirectTo: '/'
      });
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
