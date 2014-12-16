'use strict';

// Declare app level module which depends on views, and components
angular.module('ncsaas', [
  'ngRoute',
  // 'ncsaas.add-project',
  // 'ncsaas.add-resource',
  // 'ncsaas.add-service',
  // 'ncsaas.customer',
  // 'ncsaas.customer-billing',
  // 'ncsaas.customer-edit',
  // 'ncsaas.customer-plans',
  'ncsaas.dashboard',
  // 'ncsaas.home',
  // 'ncsaas.initial-data',
  // 'ncsaas.login',
  // 'ncsaas.payment-finish',
  // 'ncsaas.payment-start',
  // 'ncsaas.project',
  'ncsaas.projects',
  'ncsaas.resources',
  // 'ncsaas.service',
  'ncsaas.services',
  // 'ncsaas.user',
  // 'ncsaas.user-edit',
  // 'ncsaas.user-pass'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);
