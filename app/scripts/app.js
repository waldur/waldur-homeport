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
      })

      .when('/login/', {
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl'
      })

      .when('/projects/', {
        templateUrl: 'views/projects.html',
      })

      .when('/projects/:uuid/', {
        templateUrl: 'views/project.html',
      })

      .when('/add-project/', {
        templateUrl: 'views/add-project.html',
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
