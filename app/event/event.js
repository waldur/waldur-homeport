'use strict';

angular.module('ncsaas.event', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/event', {
    templateUrl: 'event/event.html',
    controller: 'eventCtrl'
  });
}])

.controller('eventCtrl', [function() {

}]);
