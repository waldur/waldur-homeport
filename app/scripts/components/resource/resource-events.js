import template from './resource-events.html';

export default function resourceEvents() {
  return {
    restrict: 'E',
    template: template,
    controller: ResourceEventsController,
    scope: {
      resource: '='
    }
  }
}

// @ngInject
function ResourceEventsController($scope, eventsService) {
  eventsService.getResourceEvents($scope.resource).then(function(events) {
    $scope.events = events;
  });
}
