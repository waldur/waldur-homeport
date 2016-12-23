import template from './premium-support-summary.html';

export default function premiumSupportSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      plan: '=',
      customer: '=',
      project: '='
    }
  };
}
