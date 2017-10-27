import template from './openstack-volume-summary.html';

export const openstackVolumeSummary = {
  template,
  bindings: {
    resource: '<'
  },
  controller: class openstackVolumeSummaryController {
    // @ngInject
    constructor($scope, ncUtils) {
      this.ncUtils = ncUtils;
      $scope.$watch(() => this.resource, () => {
        this.update();
      });
    }

    update() {
      if (this.resource.instance) {
        this.resource.instance_uuid = this.ncUtils.getUUID(this.resource.instance);
      }
    }
  }
};
