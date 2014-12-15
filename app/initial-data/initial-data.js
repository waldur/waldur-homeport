'use strict';

angular.module('ncsaas.initial-data', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/initial-data', {
    templateUrl: 'initial-data/initial-data.html',
    controller: 'initial-dataCtrl'
  });
}])

.controller('initial-dataCtrl', [function() {

}]);
