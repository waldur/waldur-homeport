'use strict';

angular.module('ncsaas.project', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project', {
    templateUrl: 'project/project.html',
    controller: 'projectCtrl'
  });
}])

.controller('projectCtrl', [function() {

}]);
