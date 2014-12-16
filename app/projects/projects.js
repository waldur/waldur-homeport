'use strict';

angular.module('ncsaas.projects', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/projects', {
    templateUrl: 'projects/projects.html',
    controller: 'projectsCtrl'
  });
}])

.controller('projectsCtrl', function($scope, $http) {

    // tempory data

    $scope.projects = [
        {
            Name: 'G48s-11',
            Description: 'Here goes project description.',
            Resources: [
                {
                    Type: 'VM',
                    Name: 'Res one'
                },
                {
                    Type: 'Repo',
                    Name: 'Res two'
                }
            ],
            Users: [
                {
                    Name: 'Mihail Yakimenko'
                },
                {
                    Name: 'Ilja Livenson'
                }
            ],
        },
        {
            Name: 'G48s-23',
            Description: 'Here goes project description.',
            Resources: [
                {
                    Type: 'VM',
                    Name: 'Res one'
                },
                {
                    Type: 'Repo',
                    Name: 'Res two'
                }
            ],
            Users: [
                {
                    Name: 'Avdey Avdeeych'
                },
                {
                    Name: 'Gera Libre'
                }
            ],
        }
    ];

    // example API json parse
    // $http.get('http://localhost:5000/api/').
    //     success(function(data) {
    //         $scope.projects = data;
    //     });
});
