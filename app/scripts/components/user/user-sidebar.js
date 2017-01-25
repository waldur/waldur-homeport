import template from './user-sidebar.html';

const userSidebar = {
  template,
  controllerAs: 'Ctrl',
  controller: function UserSidebarController($scope, authService, usersService, PRIVATE_USER_TABS) {
    // @ngInject
    this.items = PRIVATE_USER_TABS;
    this.logout = authService.logout;
    usersService.getCurrentUser().then(user => this.user = user);
    $scope.$on('CURRENT_USER_UPDATED', (event, { user }) => this.user = user);
  }
};

export default userSidebar;
