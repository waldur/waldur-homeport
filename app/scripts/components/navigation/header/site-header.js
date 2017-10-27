import template from './site-header.html';
import './site-header.scss';

export default {
  template: template,
  controller: class SiteHeader {
    // @ngInject
    constructor(authService, usersService, ENV, $scope) {
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
      if (this.isAuthenticated) {
        this.usersService.isCurrentUserValid().then(result => this.isValidUser = result);
      }
    }

    logout() {
      this.authService.logout();
    }
  }
};
