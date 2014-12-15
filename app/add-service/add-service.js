'use strict';

angular.module('ncsaas.add-service', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add-service', {
    templateUrl: 'add-service/add-service.html',
    controller: 'add-serviceCtrl'
  });
}])

.controller('add-serviceCtrl', [function() {

}]);
