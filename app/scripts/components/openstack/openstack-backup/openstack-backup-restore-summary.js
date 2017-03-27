const openstackBackupRestoreSummary = {
  template: '<openstack-instance-checkout-summary ng-if="$ctrl.context.resource" model="$ctrl.summaryModel"/>',
  bindings: {
    model: '<',
    field: '<',
    context: '<',
  },
  controller: class ComponentController {
    constructor($scope) {
      // @ngInject
      this.$scope = $scope;
      this.summaryModel = {};
    }

    $onInit() {
      this.$scope.$watch(() => this.model, () => {
        this.summaryModel = this.getSummaryModel();
      }, true);
    }

    getSummaryModel() {
      return {
        service: {
          settings: this.context.resource.service_settings,
          name: this.context.resource.service_name,
        },
        flavor: this.model.flavor,
        image: {
          name: this.context.resource.metadata.image_name,
        },
        customer: {
          name: this.context.resource.customer_name,
        },
        project: {
          name: this.context.resource.project_name,
        },
        system_volume_size: 0,
        data_volume_size: 0,
      };
    }
  }
};

export default openstackBackupRestoreSummary;
