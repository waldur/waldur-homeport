import template from './openstack-backup-summary.html';

export const openstackBackupSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackBackupSummaryController {
    constructor($scope, ncUtils) {
      // @ngInject
      this.ncUtils = ncUtils;
      $scope.$watch(() => this.resource, () => {
        this.update();
      });
    }

    update() {
      this.resource.instance_uuid = this.ncUtils.getUUID(this.resource.instance);
    }
  }
};
