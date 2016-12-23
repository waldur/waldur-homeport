import userSelector from './user-selector';
import addProjectMember from './add-project-member';
import addTeamMember from './add-team-member';
import customerUsersList from './customer-users-list';
import ProjectUsersListController from './project-users-list';

export default module => {
  module.directive('userSelector', userSelector);
  module.directive('addProjectMember', addProjectMember);
  module.directive('addTeamMember', addTeamMember);
  module.directive('customerUsersList', customerUsersList);
  module.controller('ProjectUsersListController', ProjectUsersListController);
};
