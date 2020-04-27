import { connectAngularComponent } from '@waldur/store/connect';

import filtersModule from './filters';
import hooksModule from './hooks/module';
import keysModule from './keys/module';
import userEvents from './list/UserEvents';
import userRoutes from './routes';
import supportModule from './support/module';
import userDetailsDialog from './support/UserDetailsDialog';
import userPopoverTable from './support/UserDetailsTable';
import userEdit from './support/UserEditContainer';
import userDetails from './user-details';
import { userPopover } from './user-popover';
import usersService from './users-service';
import { UserSidebar } from './UserSidebar';
import { stateUtilsService, attachStateUtils } from './utils';
import './events';

export default module => {
  module.component('userSidebar', connectAngularComponent(UserSidebar));
  module.component('userEvents', userEvents);
  module.directive('userDetails', userDetails);
  module.component('userEdit', userEdit);
  module.component('userPopover', userPopover);
  module.component('userPopoverTable', userPopoverTable);
  module.component('userDetailsDialog', userDetailsDialog);
  module.service('stateUtilsService', stateUtilsService);
  module.service('usersService', usersService);
  module.run(attachStateUtils);
  module.config(userRoutes);
  filtersModule(module);
  hooksModule(module);
  keysModule(module);
  supportModule(module);
};
