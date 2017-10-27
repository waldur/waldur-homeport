import template from './user-sidebar.html';
import { PRIVATE_USER_TABS } from './constants';

// @ngInject
function UserSidebarController($scope, authService, usersService) {
  this.items = PRIVATE_USER_TABS;
  this.logout = authService.logout;
  usersService.getCurrentUser().then(user => this.user = user);
  $scope.$on('CURRENT_USER_UPDATED', (event, { user }) => this.user = user);
}

const userSidebar = {
  template,
  controllerAs: 'Ctrl',
  controller: UserSidebarController,
};

export default userSidebar;
