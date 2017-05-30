import template from './customer-threshold.html';

const customerThreshold = {
  template: template,
  bindings: {
    horizontal: '<',
    priceEstimate: '=',
    toggleHardLimit: '&',
  },
  controller: class CustomerThresholdController {
    // @ngInject
    constructor(ENV, customerUtils) {
      this.currency = ENV.currency;
      this.isHardLimit = customerUtils.isHardLimit(this.priceEstimate);
    }

    validateThreshold() {
      let isValid = this.priceEstimate.threshold >= this.priceEstimate.total;
      this.thresholdForm.threshold.$setValidity('exceedsThreshold', isValid);
    }
  }
};

export default customerThreshold;
