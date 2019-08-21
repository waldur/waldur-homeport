import customerWorkspace from './customer-workspace';
import { CustomerWorkspaceController } from './customer-workspace';
import customerIssues from './CustomerIssuesList';
import customerEvents from './CustomerEventsList';
import customerTeam from './customer-team';

export default module => {
  module.controller('CustomerWorkspaceController', CustomerWorkspaceController);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerIssues', customerIssues);
  module.component('customerEvents', customerEvents);
  module.component('customerTeam', customerTeam);
};
