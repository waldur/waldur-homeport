'use strict';

(function() {
  angular.module('ncsaas')
    .directive('resourceEvents', ['eventsService', resourceEvents]);

    function resourceEvents(eventsService) {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/resource-events.html',
        scope: {
          resource: '='
        },
        link: function(scope) {
          eventsService.getResourceEvents(scope.resource).then(function(events) {
            scope.events = events;
          });
        }
      };
    }
})();
