import template from './event-types-dialog.html';
import './event-types-dialog.scss';

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
    this.dialogTitle = gettext('Event types');
    this.types = this.resolve.types;
  }
}
