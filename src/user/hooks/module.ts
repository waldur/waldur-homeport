import { connectAngularComponent } from '@waldur/store/connect';

import { HookDetailsDialog } from './HookDetailsDialog';
import { HookRemoveDialog } from './HookRemoveDialog';

export default module => {
  module.component(
    'hookDetailsDialog',
    connectAngularComponent(HookDetailsDialog, ['resolve']),
  );
  module.component(
    'hookRemoveDialog',
    connectAngularComponent(HookRemoveDialog, ['resolve']),
  );
};
