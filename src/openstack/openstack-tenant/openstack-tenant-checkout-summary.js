import template from './openstack-tenant-checkout-summary.html';

const openstackTenantCheckoutSummary = {
  template: template,
  bindings: {
    model: '<',
  },
  controller: class OpenstackTenantCheckoutSummaryController {
    // @ngInject
    constructor($scope, currentStateService) {
      this.$scope = $scope;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.currentStateService.getProject()
        .then(project => this.project = project)
        .then(() => this.setupWatchers());
    }

    setupWatchers() {
      this.updateQuotas();
      this.$scope.$watch(() => this.model, () => this.updateQuotas(), true);
    }

    updateQuotas() {
      if (!this.project ||
          !this.model.template ||
          this.project.billing_price_estimate.limit === -1) {
        this.quotas = [];
        return;
      }

      this.quotas = [
        {
          name: 'cost',
          usage: this.project.billing_price_estimate.total,
          limit: this.project.billing_price_estimate.limit,
          required: this.model.template.monthlyPrice,
        }
      ];
    }
  }
};

export default openstackTenantCheckoutSummary;
