import template from './support-agreement-summary.html';

export default function supportAgreementSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      package: '=',
      customer: '=',
      project: '='
    }
  }
}
