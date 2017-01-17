import template from './openstack-instance-summary.html';

export const openstackInstanceSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceSummaryController {
    // @ngInject
    constructor(resourceUtils) {
      this.resourceUtils = resourceUtils;
    }

    $onChanges(changes) {
      let resource = changes.resource.currentValue;
      if (!resource) {
        return;
      }

      this.resourceUtils.setAccessInfo(resource);
      resource.summary = this.resourceUtils.getSummary(resource);
      resource.uptime = this.resourceUtils.getUptime(resource);
    }
  }
};
