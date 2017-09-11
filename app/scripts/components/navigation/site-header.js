import template from './site-header.html';
import './site-header.scss';

export default {
  template: template,
  controller: class SiteHeader {
    constructor(authService, usersService, ENV, $scope) {
      // @ngInject
      this.authService = authService;
      this.headerLogo = ENV.loginLogo;
      this.usersService = usersService;
      this.$scope = $scope;
    }

    $onInit() {
      this.checkUser();
      this.$scope.$on('$stateChangeSuccess', () => this.checkUser());
    }

    checkUser() {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.usersService.isCurrentUserValid().then(result => this.isValidUser = result);
    }

    logout() {
      this.authService.logout();
    }
  }
};
