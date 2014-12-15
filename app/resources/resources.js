'use strict';

angular.module('ncsaas.resources', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/resources', {
    templateUrl: 'resources/resources.html',
    controller: 'resourcesCtrl'
  });
}])

.controller('resourcesCtrl', [function() {

}]);
