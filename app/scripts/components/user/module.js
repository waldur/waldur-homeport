import hookDetails from './hook-details';
import hookList from './hook-list';
import formatEventTitle from './hook-filter';
import keyCreate from './key-create';
import keyList from './key-list';
import userEvents from './user-events';
import userManage from './user-manage';
import userSidebar from './user-sidebar';
import userDetails, { PRIVATE_USER_TABS } from './user-details';
import userEdit from './user-edit';
import userDashboard from './user-dashboard';
import userOrganizations from './user-organizations';
import userProjects from './user-projects';
import { stateUtilsService, attachStateUtils, acceptInvitationHandler, attachInvitationUtils } from './utils';
import userRoutes from './routes';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', formatEventTitle);
  module.directive('hookList', hookList);
  module.directive('keyList', keyList);
  module.directive('keyCreate', keyCreate);
  module.directive('userEvents', userEvents);
  module.directive('userManage', userManage);
  module.directive('userSidebar', userSidebar);
  module.directive('userDetails', userDetails);
  module.directive('userEdit', userEdit);
  module.constant('PRIVATE_USER_TABS', PRIVATE_USER_TABS);
  module.directive('userDashboard', userDashboard);
  module.directive('userOrganizations', userOrganizations);
  module.directive('userProjects', userProjects);
  module.service('stateUtilsService', stateUtilsService);
  module.service('acceptInvitationHandler', acceptInvitationHandler);
  module.run(attachStateUtils);
  module.run(attachInvitationUtils);
  module.config(userRoutes);
}
