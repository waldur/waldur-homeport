import customerCreateDialog from './customer-create-dialog';
import customerDelete from './customer-delete';
import customerWorkspace from './customer-workspace';
import { customerPopover } from './customer-popover';
import customerIssues from './customer-issues';
import customerEvents from './customer-events';
import {customerUsersDetailsList} from './customer-users-details-list';
import customerTeam from './customer-team';
import routes from './routes';

export default module => {
  module.directive('customerCreateDialog', customerCreateDialog);
  module.directive('customerDelete', customerDelete);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerPopover', customerPopover);
  module.directive('customerIssues', customerIssues);
  module.directive('customerEvents', customerEvents);
  module.component('customerUsersDetailsList', customerUsersDetailsList);
  module.component('customerTeam', customerTeam);
  module.config(routes);
};
