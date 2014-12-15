'use strict';

angular.module('ncsaas.add-project', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add-project', {
    templateUrl: 'add-project/add-project.html',
    controller: 'add-projectCtrl'
  });
}])

.controller('add-projectCtrl', [function() {

}]);
