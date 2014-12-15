'use strict';

angular.module('ncsaas.user', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/user', {
    templateUrl: 'user/user.html',
    controller: 'userCtrl'
  });
}])

.controller('userCtrl', [function() {

}]);
