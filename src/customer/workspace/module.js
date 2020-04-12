import { connectAngularComponent } from '@waldur/store/connect';

import customerWorkspace from './customer-workspace';
import { CustomerWorkspaceController } from './customer-workspace';
import customerEvents from './CustomerEventsList';
import customerIssues from './CustomerIssuesList';
import { CustomerSidebar } from './CustomerSidebar';
import customerTeam from './CustomerTeam';

export default module => {
  module.controller('CustomerWorkspaceController', CustomerWorkspaceController);
  module.directive('customerWorkspace', customerWorkspace);
  module.component('customerIssues', customerIssues);
  module.component('customerEvents', customerEvents);
  module.component('customerTeam', customerTeam);
  module.component('customerSidebar', connectAngularComponent(CustomerSidebar));
};
