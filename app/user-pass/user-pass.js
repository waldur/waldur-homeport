'use strict';

angular.module('ncsaas.user-pass', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/user-pass', {
    templateUrl: 'user-pass/user-pass.html',
    controller: 'user-passCtrl'
  });
}])

.controller('user-passCtrl', [function() {

}]);
