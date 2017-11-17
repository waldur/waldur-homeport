import template from './nc-header.html';

export default {
  template: template,
  controller: class HeaderController {
    // @ngInject
    constructor(IssueNavigationService) {
      this.IssueNavigationService = IssueNavigationService;
    }

    get supportIsVisible() {
      return this.IssueNavigationService.isVisible;
    }
  }
};
