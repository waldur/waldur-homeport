'use strict';

angular.module('ncsaas.payment-finish', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/payment-finish', {
    templateUrl: 'payment-finish/payment-finish.html',
    controller: 'payment-finishCtrl'
  });
}])

.controller('payment-finishCtrl', [function() {

}]);
