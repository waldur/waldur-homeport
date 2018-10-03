import template from './support-link.html';

class SupportLinkController {
  // @ngInject
  constructor (IssueNavigationService) {
    this.IssueNavigationService = IssueNavigationService;
  }

  gotoSupport() { this.IssueNavigationService.gotoDashboard(); }

  get supportIsVisible() {
    return this.IssueNavigationService.isVisible;
  }
}

export default function supportLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: SupportLinkController
  };
}
