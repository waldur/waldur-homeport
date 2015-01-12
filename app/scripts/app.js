'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'config',
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

      .otherwise({
        redirectTo: '/'
      });
  })

  // social auth
  .config(function($authProvider) {

    $authProvider.facebook({
      clientId: '654736081301402', // '624059410963642',
      url: 'http://localhost:8080/api-auth/facebook/',
    });

    $authProvider.google({
      clientId: '251636923168-9a6n6391j5vv5v4vf0m1k3n9sl9kag41.apps.googleusercontent.com',
      url: 'http://localhost:8080/api-auth/google/',
    });

  })

  .run(function(ENV) {
    ENV.name = 'prduction';
    console.log(ENV);
  });
