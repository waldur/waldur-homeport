import template from './openstack-subnet-summary.html';

export const openstackSubnetSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackSubnetSummaryController {
    // @ngInject
    constructor($scope, ncUtils) {
      this.ncUtils = ncUtils;
      $scope.$watch(() => this.resource, () => {
        this.update();
      });
    }

    update() {
      if (!this.resource.tenant_uuid) {
        this.resource.tenant_uuid = this.ncUtils.getUUID(this.resource.tenant);
      }
      if (!this.resource.network_uuid) {
        this.resource.network_uuid = this.ncUtils.getUUID(this.resource.network);
      }
    }
  }
};
