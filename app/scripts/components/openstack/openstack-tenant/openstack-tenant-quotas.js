import template from './openstack-tenant-quotas.html';

export default {
  template,
  bindings: {
    resource: '<'
  },
  controller: class OpenstackTenantQuotasController {
    constructor(ncUtils) {
      this.ncUtils = ncUtils;
    }

    getQuotaName(quotaName) {
      return this.ncUtils.getPrettyQuotaName(quotaName);
    }
  }
};
