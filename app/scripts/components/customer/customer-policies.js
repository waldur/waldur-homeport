import template from './customer-policies.html';

const customerPolicies = {
  template: template,
  bindings: {
    customer: '<',
    canUpdateQuota: '<',
  },
  controller: class CustomerPoliciesController {
    // @ngInject
    constructor($q, ENV, ncUtilsFlash, priceEstimatesService, FreeIPAQuotaService) {
      this.$q = $q;
      this.ENV = ENV;
      this.ncUtilsFlash = ncUtilsFlash;
      this.priceEstimatesService = priceEstimatesService;
      this.FreeIPAQuotaService = FreeIPAQuotaService;
    }

    $onInit() {
      this.originalCustomer = this.customer;
      this.customer = angular.copy(this.customer);
      this.thresholdModel = {
        isHardLimit: this.priceEstimatesService.isHardLimit(this.customer.billing_price_estimate),
        priceEstimate: this.customer.billing_price_estimate
      };
      this.thresholdField = {
        horizontal: true,
      };

      this.currency = this.ENV.currency;
      this.quota = this.FreeIPAQuotaService.loadQuota(this.customer);
    }

    updatePolicies() {
      let promises = [
        this.priceEstimatesService.update(this.thresholdModel.priceEstimate).then(() => {
          this.originalCustomer.billing_price_estimate.limit = this.thresholdModel.priceEstimate.limit;
          this.originalCustomer.billing_price_estimate.threshold = this.thresholdModel.priceEstimate.threshold;
        })
      ];

      if (this.quota) {
        promises.push(this.FreeIPAQuotaService.saveQuota(this.originalCustomer, this.quota));
      }

      return this.$q.all(promises).then(() => {
        this.ncUtilsFlash.success(gettext('Organization policies have been updated.'));
      }).catch((response) => {
        if (response.status === 400) {
          for (let name in response.data) {
            let message = response.data[name];
            this.ncUtilsFlash.error(message);
          }
        } else {
          this.ncUtilsFlash.error(gettext('An error occurred on policies update.'));
        }
      });
    }
  }
};

export default customerPolicies;
