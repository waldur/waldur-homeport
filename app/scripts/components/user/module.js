import hookDetails from './hook-details';
import hookList from './hook-list';
import formatEventTitle from './hook-filter';
import keyCreate from './key-create';
import keyList from './key-list';
import userEvents from './user-events';
import userDelete from './user-delete';
import userSidebar from './user-sidebar';
import userDetails, { PRIVATE_USER_TABS } from './user-details';
import userDashboard from './user-dashboard';
import userOrganizations from './user-organizations';
import userProjects from './user-projects';
import UserEventsController from './user-events';
import userRoutes from './routes';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', formatEventTitle);
  module.directive('hookList', hookList);
  module.directive('keyList', keyList);
  module.directive('keyCreate', keyCreate);
  module.directive('userEvents', userEvents);
  module.directive('userDelete', userDelete);
  module.directive('userSidebar', userSidebar);
  module.directive('userDetails', userDetails);
  module.constant('PRIVATE_USER_TABS', PRIVATE_USER_TABS);
  module.directive('userDashboard', userDashboard);
  module.directive('userOrganizations', userOrganizations);
  module.directive('userProjects', userProjects);
  module.config(userRoutes);
}
