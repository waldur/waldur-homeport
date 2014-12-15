'use strict';

angular.module('ncsaas.projects', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/projects', {
    templateUrl: 'projects/projects.html',
    controller: 'projectsCtrl'
  });
}])

.controller('projectsCtrl', [function() {

}]);
