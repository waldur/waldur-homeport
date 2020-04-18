import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerPopover } from './CustomerPopover';

export default module => {
  module.component(
    'customerPopover',
    connectAngularComponent(CustomerPopover, ['resolve']),
  );
};
