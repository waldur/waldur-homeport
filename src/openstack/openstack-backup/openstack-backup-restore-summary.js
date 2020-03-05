const openstackBackupRestoreSummary = {
  template:
    '<openstack-instance-checkout-summary ng-if="$ctrl.resource" model="$ctrl.summaryModel"></openstack-instance-checkout-summary>',
  bindings: {
    model: '<',
    field: '<',
    context: '<',
  },
  controller: class ComponentController {
    // @ngInject
    constructor($scope, resourcesService) {
      this.$scope = $scope;
      this.resourcesService = resourcesService;
      this.summaryModel = {};
    }

    $onInit() {
      this.loadResource();
      this.setupWatcher();
    }

    loadResource() {
      if (!this.context.resource.metadata) {
        this.resourcesService
          .$get(null, null, this.context.resource.url)
          .then(resource => (this.resource = resource));
      } else {
        this.resource = this.context.resource;
      }
    }

    setupWatcher() {
      this.$scope.$watch(
        () => [this.model, this.resource],
        () => {
          this.summaryModel = this.getSummaryModel();
        },
        true,
      );
    }

    getSummaryModel() {
      if (!this.resource) {
        return;
      }
      return {
        service: {
          settings: this.resource.service_settings,
          name: this.resource.service_name,
          service_project_link_url: this.resource.service_project_link,
        },
        flavor: this.model.flavor,
        image: {
          name: this.resource.metadata.image_name,
        },
        customer: {
          name: this.resource.customer_name,
        },
        project: {
          name: this.resource.project_name,
        },
        system_volume_size: this.resource.metadata.size,
        data_volume_size: 0,
      };
    }
  },
};

export default openstackBackupRestoreSummary;
