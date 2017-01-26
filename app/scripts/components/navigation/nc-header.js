import template from './nc-header.html';

export default {
  template: template,
  controller: class AppHeader {
    constructor(authService, IssueNavigationService) {
      // @ngInject
      this.authService = authService;
      this.IssueNavigationService = IssueNavigationService;
    }

    logout() {
      this.authService.logout();
    }

    gotoSupport() {
      return this.IssueNavigationService.gotoDashboard();
    }
  }
};
