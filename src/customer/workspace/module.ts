import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerSidebar } from './CustomerSidebar';
import { CustomerWorkspace } from './CustomerWorkspace';

export default module => {
  module.component('customerSidebar', connectAngularComponent(CustomerSidebar));
  module.component(
    'customerWorkspace',
    connectAngularComponent(CustomerWorkspace),
  );
};
