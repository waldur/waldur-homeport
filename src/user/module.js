import { connectAngularComponent } from '@waldur/store/connect';

import filtersModule from './filters';
import hooksModule from './hooks/module';
import keysModule from './keys/module';
import userOrganizations from './list/CustomerPermissions';
import userProjects from './list/ProjectPermissions';
import userDashboard from './list/UserDashboard';
import userEvents from './list/UserEvents';
import userRoutes from './routes';
import supportModule from './support/module';
import userDetailsDialog from './support/UserDetailsDialog';
import userPopoverTable from './support/UserDetailsTable';
import userEdit from './support/UserEditContainer';
import userListView from './support/UserListView';
import userDetails from './user-details';
import { userPopover } from './user-popover';
import userManage from './UserManage';
import usersService from './users-service';
import { UserSidebar } from './UserSidebar';
import { stateUtilsService, attachStateUtils } from './utils';
import './events';

export default module => {
  module.component('userSidebar', connectAngularComponent(UserSidebar));
  module.component('userEvents', userEvents);
  module.component('userManage', userManage);
  module.directive('userDetails', userDetails);
  module.component('userEdit', userEdit);
  module.component('userDashboard', userDashboard);
  module.component('userOrganizations', userOrganizations);
  module.component('userProjects', userProjects);
  module.component('userPopover', userPopover);
  module.component('userPopoverTable', userPopoverTable);
  module.component('userDetailsDialog', userDetailsDialog);
  module.component('userListView', userListView);
  module.service('stateUtilsService', stateUtilsService);
  module.service('usersService', usersService);
  module.run(attachStateUtils);
  module.config(userRoutes);
  filtersModule(module);
  hooksModule(module);
  keysModule(module);
  supportModule(module);
};
