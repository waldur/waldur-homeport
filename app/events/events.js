'use strict';

angular.module('ncsaas.events', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/events', {
    templateUrl: 'events/events.html',
    controller: 'eventsCtrl'
  });
}])

.controller('eventsCtrl', [function() {

}]);
