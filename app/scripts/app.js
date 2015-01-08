'use strict';

angular
  // module name and dependencies
  .module('ncsaas', [
    'config',
    'ngRoute',
    'ngCookies',])
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

      .otherwise({
        redirectTo: '/'
      });
  });
