'use strict';

angular.module('ncsaas.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'dashboardCtrl'
  });
}])

.controller('dashboardCtrl', function($scope) {

    // tempory data

    $scope.events = [
        {
            title: 'Bash update! Urgent!',
            description: 'Some interesting happening? Yes, we need to update bash!'
        },
        {
            title: 'Need payment on this week',
            description: 'We should pay for DigitalOcean'
        }
    ];

});
