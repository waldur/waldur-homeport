import template from './support-link.html';

// @ngInject
function SupportLinkController(IssueNavigationService) {
  this.gotoSupport = () => IssueNavigationService.gotoDashboard();
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
