import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerWorkspace } from './CustomerWorkspace';

export default module => {
  module.component(
    'customerWorkspace',
    connectAngularComponent(CustomerWorkspace),
  );
};
