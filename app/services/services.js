'use strict';

angular.module('ncsaas.services', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/services', {
    templateUrl: 'services/services.html',
    controller: 'servicesCtrl'
  });
}])

.controller('servicesCtrl', [function() {

}]);
