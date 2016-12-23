import template from './openstack-tenant-summary.html';

export default function openstackTenantSummary() {
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
