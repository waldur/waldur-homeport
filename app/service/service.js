'use strict';

angular.module('ncsaas.service', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/service', {
    templateUrl: 'service/service.html',
    controller: 'serviceCtrl'
  });
}])

.controller('serviceCtrl', [function() {

}]);
