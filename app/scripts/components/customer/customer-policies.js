import template from './customer-policies.html';

const customerPolicies = {
  template: template,
  bindings: {
    customer: '<',
    isHardLimit: '<',
  },
  controller: class CustomerPoliciesController {
    // @ngInject
    constructor($q, ncUtilsFlash, priceEstimatesService, ENV) {
      this.$q = $q;
      this.ncUtilsFlash = ncUtilsFlash;
      this.priceEstimatesService = priceEstimatesService;
      this.currency = ENV.currency;
      this.customer = angular.copy(this.customer);
    }

    updatePolicies() {
      const promises = [
        this.saveLimit(),
        this.saveThreshold(),
      ];

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

    saveLimit() {
      const limit = this.isHardLimit ? this.customer.price_estimate.threshold : -1;
      return this.priceEstimatesService.setLimit(this.customer.url, limit);
    }

    saveThreshold() {
      return this.priceEstimatesService.setThreshold(this.customer.url, this.customer.price_estimate.threshold);
    }

    validateThreshold() {
      let isValid = this.customer.price_estimate.threshold >= this.customer.price_estimate.total;
      this.policiesForm.threshold.$setValidity('exceedsThreshold', isValid);
    }
  }
};

export default customerPolicies;
