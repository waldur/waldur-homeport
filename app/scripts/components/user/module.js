import hookDetails from './hook-details';
import HookListController from './hook-list';
import formatEventTitle from './hook-filter';
import keyCreate from './key-create';
import KeyListController from './key-list';
import UserEventsListController from './user-events-list';
import userDelete from './user-delete';
import userSidebar from './user-sidebar';
import userDetails, { PRIVATE_USER_TABS } from './user-details';
import userDashboard from './user-dashboard';
import UserOrganizationsController from './user-organizations';
import UserProjectsController from './user-projects';
import UserEventsController from './user-events';
import userRoutes from './routes';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', formatEventTitle);
  module.controller('HookListController', HookListController);
  module.controller('KeyListController', KeyListController);
  module.directive('keyCreate', keyCreate);
  module.controller('UserEventsListController', UserEventsListController);
  module.directive('userDelete', userDelete);
  module.directive('userSidebar', userSidebar);
  module.directive('userDetails', userDetails);
  module.constant('PRIVATE_USER_TABS', PRIVATE_USER_TABS);
  module.directive('userDashboard', userDashboard);
  module.controller('UserOrganizationsController', UserOrganizationsController);
  module.controller('UserProjectsController', UserProjectsController);
  module.controller('UserEventsController', UserEventsController);
  module.config(userRoutes);
}
