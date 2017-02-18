import customerCreateDialog from './customer-create-dialog';
import customerDelete from './customer-delete';
import customerWorkspace from './customer-workspace';
import { CustomerWorkspaceController } from './customer-workspace';
import { customerPopover } from './customer-popover';
import customerAlerts from './customer-alerts';
import customerIssues from './customer-issues';
import customerEvents from './customer-events';
import {customerUsersDetailsList} from './customer-users-details-list';
import customerTeam from './customer-team';
import customerSizing from './customer-sizing';
import routes from './routes';

export default module => {
  module.directive('customerCreateDialog', customerCreateDialog);
  module.directive('customerDelete', customerDelete);
  module.controller('CustomerWorkspaceController', CustomerWorkspaceController);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerPopover', customerPopover);
  module.component('customerAlerts', customerAlerts);
  module.directive('customerIssues', customerIssues);
  module.directive('customerEvents', customerEvents);
  module.component('customerUsersDetailsList', customerUsersDetailsList);
  module.component('customerTeam', customerTeam);
  module.component('customerSizing', customerSizing);
  module.config(routes);
};
