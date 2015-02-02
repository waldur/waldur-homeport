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
        templateUrl: 'views/user.html',
      })

      .when('/customer/', {
        templateUrl: 'views/customer.html',
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
