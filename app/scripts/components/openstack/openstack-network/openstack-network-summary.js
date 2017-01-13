import template from './openstack-network-summary.html';

export const openstackNetworkSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackNetworkSummaryController {
    constructor(ncUtils) {
      // @ngInject
      this.ncUtils = ncUtils;
    }
    $onInit() {
      this.resource.tenant_uuid = this.ncUtils.getUUID(this.resource.tenant);
    }
  }
};
