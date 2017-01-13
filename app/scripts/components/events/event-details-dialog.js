import template from './event-details-dialog.html';

export default function eventDetailsDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: EventDetailsDialogController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

// @ngInject
function EventDetailsDialogController() {
}
