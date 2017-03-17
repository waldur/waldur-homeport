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
  constructor($filter, coreUtils) {
    this.type = coreUtils.templateFormatter(gettext('{eventType} types'), {eventType: $filter('titleCase')(this.resolve.type)});
    this.types = this.resolve.types;
  }
}
