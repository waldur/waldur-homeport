import alertFormatter from './alert-formatter';
import alertsService from './alerts-service';
import AlertDialogsService from './alert-dialogs-service';
import alertFilter from './alert-filter';
import BaseAlertsListController from './base-alerts-list';

export default module => {
  module.service('alertFormatter', alertFormatter);
  module.service('alertsService', alertsService);
  module.service('AlertDialogsService', AlertDialogsService);
  module.directive('alertFilter', alertFilter);
  module.service('BaseAlertsListController', BaseAlertsListController);
}
