'use strict';

angular
  // module name and dependencies
  .module('ncsaas', [
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

      .otherwise({
        redirectTo: '/'
      });
  })
  // constants
  .constant('APIURL', 'http://127.0.0.1:8080/api/');
