import userSelector from './user-selector';
import addProjectMember from './add-project-member';
import addTeamMember from './add-team-member';
import invitationDialog from './invitation-dialog';
import CustomerInvitationsTabController from './invitations-list';
import CustomerTeamTabController from './customer-users-list';
import ProjectUsersListController from './project-users-list';

export default module => {
  module.directive('userSelector', userSelector);
  module.directive('addProjectMember', addProjectMember);
  module.directive('addTeamMember', addTeamMember);
  module.directive('invitationDialog', invitationDialog);
  module.controller('CustomerInvitationsTabController', CustomerInvitationsTabController);
  module.controller('CustomerTeamTabController', CustomerTeamTabController);
  module.controller('ProjectUsersListController', ProjectUsersListController);
}
