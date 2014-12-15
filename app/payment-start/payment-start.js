'use strict';

angular.module('ncsaas.payment-start', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/payment-start', {
    templateUrl: 'payment-start/payment-start.html',
    controller: 'payment-startCtrl'
  });
}])

.controller('payment-startCtrl', [function() {

}]);
