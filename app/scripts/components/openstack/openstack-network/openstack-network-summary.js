import template from './openstack-network-summary.html';

export const openstackNetworkSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackNetworkSummaryController {
    constructor($scope, ncUtils) {
      // @ngInject
      this.ncUtils = ncUtils;
      $scope.$watch(() => this.resource, () => {
        this.update();
      });
    }

    update() {
      this.resource.tenant_uuid = this.ncUtils.getUUID(this.resource.tenant);
    }
  }
};
