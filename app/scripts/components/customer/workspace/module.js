import customerWorkspace from './customer-workspace';
import { CustomerWorkspaceController } from './customer-workspace';
import customerIssues from './customer-issues';
import customerEvents from './customer-events';
import customerTeam from './customer-team';

export default module => {
  module.controller('CustomerWorkspaceController', CustomerWorkspaceController);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerIssues', customerIssues);
  module.component('customerEvents', customerEvents);
  module.component('customerTeam', customerTeam);
};
