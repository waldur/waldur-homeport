import template from './event-types-dialog.html';

export default function eventTypesDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: EventTypesDialogController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      resolve: '='
    }
  };
}

class EventTypesDialogController {
  constructor() {
    this.type = this.resolve.type;
    this.types = this.resolve.types;
  }
}
