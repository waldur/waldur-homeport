import { CustomerUtilsService } from './customer-utils';
import customerCreateDialog from './customer-create-dialog';
import customerDelete from './customer-delete';
import customerWorkspace from './customer-workspace';
import customerPopover from './customer-popover';
import customerIssues from './customer-issues';
import customerEvents from './customer-events';
import routes from './routes';

export default module => {
  module.service('CustomerUtilsService', CustomerUtilsService);
  module.directive('customerCreateDialog', customerCreateDialog);
  module.directive('customerDelete', customerDelete);
  module.directive('customerWorkspace', customerWorkspace);
  module.directive('customerPopover', customerPopover);
  module.directive('customerIssues', customerIssues);
  module.directive('customerEvents', customerEvents);
  module.config(routes);
};
