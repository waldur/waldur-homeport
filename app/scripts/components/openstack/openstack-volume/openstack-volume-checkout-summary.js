import template from './openstack-volume-checkout-summary.html';

class SummaryController {
  // @ngInject
  constructor(OpenStackSummaryService, currentStateService, coreUtils, $q, $scope) {
    this.OpenStackSummaryService = OpenStackSummaryService;
    this.currentStateService = currentStateService;
    this.coreUtils = coreUtils;
    this.$q = $q;
    this.$scope = $scope;
  }

  $onInit() {
    this.loading = true;
    this.components = {};
    this.quotas = [];
    this.$q.all([this.loadProject(), this.loadQuotas()])
      .then(() => this.setupWatchers())
      .finally(() => this.loading = false);
  }

  loadProject() {
    return this.currentStateService.getProject()
      .then(project => this.project = project);
  }

  loadQuotas() {
    return this.OpenStackSummaryService.getServiceComponents(this.model.service)
      .then(result => {
        this.components = result.components;
        this.usages = result.usages;
        this.limits = result.limits;
        this.limitsType = result.limitsType;
      });
  }

  setupWatchers() {
    this.componentsMessage =
      this.coreUtils.templateFormatter(
        gettext('Note that this volume is charged as part of <strong>{serviceName}</strong> package.'),
        { serviceName: this.model.service.name });

    this.$scope.$watch(() => this.model, () => this.updateQuotas(), true);
    this.updateQuotas();
  }

  updateQuotas() {
    this.quotas = [
      {
        name: 'storage',
        usage: this.usages.disk,
        limit: this.limits.disk,
        limitType: this.limitsType.disk,
        required: this.model.size || 0
      },
      {
        name: 'cost',
        usage: this.project.billing_price_estimate.total,
        limit: this.project.billing_price_estimate.limit,
        required: this.getMonthlyPrice()
      }
    ];
  }

  getDailyPrice() {
    if (this.components && this.model.size) {
      return this.model.size * this.components.disk;
    } else {
      return 0;
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
