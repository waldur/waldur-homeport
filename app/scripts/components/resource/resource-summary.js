import template from './resource-summary.html';
import './resource-summary.scss';

const resourceSummary = {
  bindings: {
    resource: '<'
  },
  template: template,
  controller: class ResourceSummaryController {
    // @ngInject
    constructor(resourceUtils, ncUtils, currentStateService, ENV) {
      this.resourceUtils = resourceUtils;
      this.ncUtils = ncUtils;
      this.currentStateService = currentStateService;
      this.ENV = ENV;
    }

    $onChanges(changes) {
      let resource = changes.resource.currentValue;
      if (!resource) {
        return;
      }

      resource.isVolume = resource.resource_type.toLowerCase().indexOf('volume') !== -1;
      resource.isBackup = resource.resource_type.toLowerCase().indexOf('backup') !== -1;
      resource.isNetwork = resource.resource_type.toLowerCase().indexOf('network') !== -1;
      resource.isSubnet = resource.resource_type.toLowerCase().indexOf('subnet') !== -1;
      resource.label = resource.isBackup ? 'Instance' : 'Attached to';
      resource.summaryLabel = resource.isVolume ? 'Size' : 'Summary';
      this.resourceUtils.setAccessInfo(resource);
      resource.service_type = resource.resource_type.split('.')[0];
      resource.customer_uuid = this.currentStateService.getCustomerUuid();
      resource.summary = this.resourceUtils.getSummary(resource);
      resource.uptime = this.resourceUtils.getUptime(resource);
      resource.error_message = resource.error_message || this.ENV.defaultErrorMessage;

      if (resource.isNetwork || resource.isSubnet) {
        resource.tenantUUID = this.ncUtils.getUUID(resource.tenant);
      }

      if (resource.isSubnet) {
        resource.networkUUID = this.ncUtils.getUUID(resource.network);
        resource.allocationPools = this.resourceUtils.formatAllocationPools(resource.allocation_pools);
      }

      if (resource.instance) {
        resource.instance_uuid = this.ncUtils.getUUID(resource.instance);
      }

      if (resource.source_volume) {
        resource.source_volume_uuid = this.ncUtils.getUUID(resource.source_volume);
      }
    }
  }
};

export default resourceSummary;
