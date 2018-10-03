import template from './logout-link.html';

// @ngInject
function LogoutLinkController(authService) {
  this.logout = () => authService.logout();
}

export default function logoutLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: LogoutLinkController,
  };
}
