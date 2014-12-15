'use strict';

angular.module('ncsaas.customer-billing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customer-billing', {
    templateUrl: 'customer-billing/customer-billing.html',
    controller: 'customer-billingCtrl'
  });
}])

.controller('customer-billingCtrl', [function() {

}]);
