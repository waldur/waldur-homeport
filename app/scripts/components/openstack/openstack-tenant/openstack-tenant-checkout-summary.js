import template from './openstack-tenant-checkout-summary.html';

const openstackTenantCheckoutSummary = {
  template: template,
  bindings: {
    model: '<',
    customer: '<',
    project: '<'
  }
};

export default openstackTenantCheckoutSummary;
