import template from './openstack-snapshot-summary.html';

export const openstackSnapshotSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackSnapshotSummaryController {
    constructor($scope, ncUtils) {
      // @ngInject
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
