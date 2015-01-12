'use strict';

angular
  // module name and dependencies
  .module('ncsaas', [
    'config',
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

      .when('/add-project/', {
        templateUrl: 'views/add-project.html',
      })

      .otherwise({
        redirectTo: '/'
      });
  });
