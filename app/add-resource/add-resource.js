'use strict';

angular.module('ncsaas.add-resource', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add-resource', {
    templateUrl: 'add-resource/add-resource.html',
    controller: 'add-resourceCtrl'
  });
}])

.controller('add-resourceCtrl', [function() {

}]);
