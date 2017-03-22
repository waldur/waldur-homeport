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
    this.dialogTitle = this.resolve.type === 'Events' ? gettext('Event types') : gettext('Alert types');
    this.types = this.resolve.types;
  }
}
