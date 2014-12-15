'use strict';

angular.module('ncsaas.user-edit', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/user-edit', {
    templateUrl: 'user-edit/user-edit.html',
    controller: 'user-editCtrl'
  });
}])

.controller('user-editCtrl', [function() {

}]);
