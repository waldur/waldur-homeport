'use strict';

angular.module('ncsaas.customer-plans', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customer-plans', {
    templateUrl: 'customer-plans/customer-plans.html',
    controller: 'customer-plansCtrl'
  });
}])

.controller('customer-plansCtrl', [function() {

}]);
