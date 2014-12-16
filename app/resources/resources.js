'use strict';

angular.module('ncsaas.resources', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/resources', {
    templateUrl: 'resources/resources.html',
    controller: 'resourcesCtrl'
  });
}])

.controller('resourcesCtrl', function($scope) {

    // tempory data

    $scope.resources = [
        {
            Name: 'Resource Name',
            Type: 'github',
            Poject: 'Project: ZH-11'
        },
        {
            Name: 'Liboola',
            Type: 'VM',
            Poject: 'Project: ZH-11'
        },
        {
            Name: 'Fractal 51',
            Type: 'DO',
            Poject: 'Project: ZH-11'
        }
    ];
});
