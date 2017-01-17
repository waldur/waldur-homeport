import template from './openstack-tenant-checkout-summary.html';

export default function openstackTenantCheckoutSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      model: '=',
      customer: '=',
      project: '='
    }
  };
}
