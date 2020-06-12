import { UsersService } from '@waldur/user/UsersService';

import template from './site-header.html';
import './site-header.scss';

export default {
  template: template,
  controller: class SiteHeader {
    // @ngInject
    constructor(authService, ENV, NavigationUtilsService, $scope) {
      this.authService = authService;
      this.headerLogo = ENV.loginLogo;
      this.NavigationUtilsService = NavigationUtilsService;
      this.$scope = $scope;
    }

    $onInit() {
      this.checkUser();
      this.$scope.$on('$stateChangeSuccess', () => this.checkUser());
    }

    goBack() {
      this.NavigationUtilsService.goBack();
    }

    checkUser() {
      this.isAuthenticated = this.authService.isAuthenticated();
      if (this.isAuthenticated) {
        UsersService.isCurrentUserValid().then(
          result => (this.isValidUser = result),
        );
      }
    }

    logout() {
      this.authService.logout();
    }
  },
};
