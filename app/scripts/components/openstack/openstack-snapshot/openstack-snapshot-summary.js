import template from './openstack-snapshot-summary.html';

export const openstackSnapshotSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackSnapshotSummaryController {
    // @ngInject
    constructor($scope, ncUtils) {
      this.ncUtils = ncUtils;
      $scope.$watch(() => this.resource, () => {
        this.update();
      });
    }

    update() {
      this.resource.source_volume_uuid = this.ncUtils.getUUID(this.resource.source_volume);
    }
  }
};
