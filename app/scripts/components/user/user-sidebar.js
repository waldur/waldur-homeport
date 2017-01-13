import template from './user-sidebar.html';

export default function userSidebar() {
  return {
    restrict: 'E',
    template: template,
    controller: UserSidebarController,
    controllerAs: 'Ctrl',
    bindToController: true,
  };
}

// @ngInject
function UserSidebarController(authService, usersService, PRIVATE_USER_TABS) {
  var ctrl = this;
  ctrl.items = PRIVATE_USER_TABS;
  ctrl.logout = authService.logout;
  usersService.getCurrentUser().then(function(user) {
    ctrl.user = user;
  });
}
