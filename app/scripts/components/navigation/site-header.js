import template from './site-header.html';

export default {
  template: template,
  controller: class SiteHeader {
    constructor(authService, ENV) {
      // @ngInject
      this.authService = authService;
      this.ENV = ENV;
    }

    $onInit() {
      this.headerLogo = this.ENV.loginLogo;
    }

    logout() {
      this.authService.logout();
    }
  }
};
