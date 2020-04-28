import { connectAngularComponent } from '@waldur/store/connect';

import { UserEmailChangeDialog } from './UserEmailChangeDialog';
import { UserRemovalMessageDialog } from './UserRemovalMessageDialog';

export default module => {
  module.component(
    'userRemovalMessageDialog',
    connectAngularComponent(UserRemovalMessageDialog, ['resolve']),
  );
  module.component(
    'userEmailChangeDialog',
    connectAngularComponent(UserEmailChangeDialog, ['resolve']),
  );
};
