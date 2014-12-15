'use strict';

angular.module('ncsaas.customer-edit', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customer-edit', {
    templateUrl: 'customer-edit/customer-edit.html',
    controller: 'customer-editCtrl'
  });
}])

.controller('customer-editCtrl', [function() {

}]);
