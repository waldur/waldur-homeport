import template from './openstack-instance-checkout-summary.html';

export default function openstackInstanceCheckoutSummary() {
  return {
    restrict: 'E',
    template: template,
    controller: SummaryController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      model: '='
    }
  };
}

// @ngInject
class SummaryController {
  constructor(OpenStackSummaryService, coreUtils, $filter, $scope) {
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.coreUtils = coreUtils;
    this.$filter = $filter;
    this.$scope = $scope;
    this.init();
  }

  init() {
    this.loading = true;
    this.components = {};
    this.quotas = [];
    this.OpenStackSummaryService.getServiceComponents(this.model.service)
      .then(result => {
        this.components = result.components;
        this.usages = result.usages;
        this.limits = result.limits;

        this.componentsMessage =
          this.coreUtils.templateFormatter(
            gettext('Note that this virtual machine is charged as part of <strong>{serviceName}</strong> package.'),
            { serviceName: this.model.service.name });

        this.$scope.$watch(() => this.model, () => this.updateQuotas(), true);
        this.updateQuotas();
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateQuotas() {
    this.quotas = [
      {
        name: 'ram',
        usage: this.usages.ram,
        limit: this.limits.ram,
        required: this.model.flavor && this.model.flavor.ram
      },
      {
        name: 'cores',
        usage: this.usages.cores,
        limit: this.limits.cores,
        required: this.model.flavor && this.model.flavor.cores
      },
      {
        name: 'storage',
        usage: this.usages.disk,
        limit: this.limits.disk,
        required: this.getTotalStorage() || 0
      },
    ];
  }

  isValid() {
    return this.getDailyPrice();
  }

  getDailyPrice() {
    if (this.components && this.model.flavor) {
      return this.model.flavor.cores * this.components.cores +
             this.model.flavor.ram * this.components.ram +
             this.getTotalStorage() * this.components.disk;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }

  getTotalStorage() {
    return this.model.system_volume_size + this.model.data_volume_size;
  }
}

