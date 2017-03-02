import template from './support-link.html';

export default function supportLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: function SupportLinkController(IssueNavigationService) {
      // @ngInject
      this.gotoSupport = () => IssueNavigationService.gotoDashboard();
    }
  };
}
