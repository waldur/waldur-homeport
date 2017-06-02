import template from './customer-policies.html';

const customerPolicies = {
  template: template,
  bindings: {
    customer: '<',
  },
  controller: class CustomerPoliciesController {
    // @ngInject
    constructor($q, ncUtilsFlash, customerUtils) {
      this.$q = $q;
      this.ncUtilsFlash = ncUtilsFlash;
      this.customer = angular.copy(this.customer);
      this.customerUtils = customerUtils;
      this.isHardLimit = this.customerUtils.isHardLimit(this.customer.price_estimate);
    }

    toggleHardLimit() {
      this.isHardLimit = !this.isHardLimit;
    }

    updatePolicies() {
      const promises = [
        this.customerUtils.saveLimit(this.isHardLimit, this.customer),
        this.customerUtils.saveThreshold(this.customer),
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
  }
};

export default customerPolicies;
