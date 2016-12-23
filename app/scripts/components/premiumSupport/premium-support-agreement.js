import template from './premium-support-agreement.html';

export default function premiumSupportAgreement() {
  return {
    restrict: 'E',
    template: template,
    controller: function() {},
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      plan: '=',
      onSubmit: '&'
    }
  };
}
