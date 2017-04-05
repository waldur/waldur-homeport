import template from './openstack-volume-checkout-summary.html';

// @ngInject
class SummaryController {
  constructor(OpenStackSummaryService, coreUtils, $scope) {
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.coreUtils = coreUtils;
    this.$scope = $scope;
  }

  $onInit() {
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
            gettext('Note that this volume is charged as part of <strong>{serviceName}</strong> package.'),
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
        name: 'storage',
        usage: this.usages.disk,
        limit: this.limits.disk,
        required: this.model.size || 0
      }
    ];
  }

  getDailyPrice() {
    if (this.components && this.model.size) {
      return this.model.size * this.components.disk;
    }
  }

  getMonthlyPrice() {
    return this.getDailyPrice() * 30;
  }
}

const openstackVolumeCheckoutSummary = {
  template: template,
  controller: SummaryController,
  bindings: {
    model: '<'
  }
};

export default openstackVolumeCheckoutSummary;
