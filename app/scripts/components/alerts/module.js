import { generateModalContentComponent } from '@waldur/core/utils';
import alertFormatter from './alert-formatter';
import alertsService from './alerts-service';
import AlertTypesDialog from './AlertTypesDialog';
import AlertDialogsService from './alert-dialogs-service';
import alertFilter from './alert-filter';
import BaseAlertsListController from './base-alerts-list';

export default module => {
  module.service('alertFormatter', alertFormatter);
  module.service('alertsService', alertsService);

  // TODO: a temporary solution for as long as we have heterogenuous (React-Ng) system.
  module.component('alertTypesDialogReact', AlertTypesDialog);
  module.component('alertTypesDialog', generateModalContentComponent('alert-types-dialog-react'));

  module.service('AlertDialogsService', AlertDialogsService);
  module.directive('alertFilter', alertFilter);
  module.service('BaseAlertsListController', BaseAlertsListController);
};
