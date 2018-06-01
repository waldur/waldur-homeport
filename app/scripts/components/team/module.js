import userSelector from './user-selector';
import addProjectMember from './add-project-member';
import addTeamMember from './add-team-member';
import customerUsersList from './customer-users-list';
import { projectUsers } from './project-users-list';
import customerPermissionsLogService from './customer-permissions-log-service';
import projectPermissionsLogService from './project-permissions-log-service';
import customerPermissionsLogList from './CustomerPermissionsLogList';
import projectPermissionsLogList from './ProjectPermissionsLogList';
import './events';

export default module => {
  module.service('customerPermissionsLogService', customerPermissionsLogService);
  module.service('projectPermissionsLogService', projectPermissionsLogService);
  module.directive('userSelector', userSelector);
  module.component('addProjectMember', addProjectMember);
  module.component('addTeamMember', addTeamMember);
  module.directive('customerUsersList', customerUsersList);
  module.component('projectUsers', projectUsers);
  module.component('customerPermissionsLogList', customerPermissionsLogList);
  module.component('projectPermissionsLogList', projectPermissionsLogList);
};
