import template from './app-footer.html';

export const appFooter = {
  template,
  controller: class AppFooterController {
    // @ngInject
    constructor(ENV, authService) {
      this.buildId = ENV.buildId;
      this.companyName = ENV.companyName;
      this.companyUrl = ENV.companyUrl;
      this.isAuthenticated = authService.isAuthenticated;
      this.supportEmail = ENV.supportEmail;
      this.supportPhone = ENV.supportPhone;
    }
  }
};
