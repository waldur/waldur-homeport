import template from './logout-link.html';

export default function logoutLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: function LogoutLinkController(authService) {
      // @ngInject
      this.logout = () => authService.logout();
    }
  };
}
