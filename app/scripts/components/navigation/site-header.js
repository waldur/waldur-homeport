import template from './site-header.html';
import './site-header.scss';

export default {
  template: template,
  controller: class SiteHeader {
    constructor(authService, ENV) {
      // @ngInject
      this.authService = authService;
      this.headerLogo = ENV.loginLogo;
    }

    $onInit() {
      this.isAuthenticated = this.authService.isAuthenticated();
    }

    logout() {
      this.authService.logout();
    }
  }
};
