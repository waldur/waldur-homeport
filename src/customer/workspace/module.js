import { connectAngularComponent } from '@waldur/store/connect';

import customerEvents from './CustomerEventsList';
import customerIssues from './CustomerIssuesList';
import { CustomerSidebar } from './CustomerSidebar';
import customerTeam from './CustomerTeam';
import { CustomerWorkspace } from './CustomerWorkspace';

export default module => {
  module.component(
    'customerWorkspace',
    connectAngularComponent(CustomerWorkspace),
  );
  module.component('customerIssues', customerIssues);
  module.component('customerEvents', customerEvents);
  module.component('customerTeam', customerTeam);
  module.component('customerSidebar', connectAngularComponent(CustomerSidebar));
};
