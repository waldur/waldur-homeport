import template from './customer-threshold.html';

const customerThreshold = {
  template: template,
  bindings: {
    field: '<',
    form: '=',
    model: '=',
  },
  controller: class CustomerThresholdController {
    // @ngInject
    constructor(ENV, priceEstimatesService) {
      this.currency = ENV.currency;
      this.priceEstimatesService = priceEstimatesService;
    }

    $onInit() {
      this.model.isHardLimit = this.priceEstimatesService.isHardLimit(this.model.priceEstimate);
      this.updateLimit();
    }

    updateLimit() {
      this.model.priceEstimate.limit = this.model.isHardLimit ? this.model.priceEstimate.threshold : -1;
    }

    thresholdChanged() {
      this.validateThreshold();
      this.updateLimit();
    }

    validateThreshold() {
      let isValid = this.model.priceEstimate.threshold >= this.model.priceEstimate.total;
      this.thresholdForm.threshold.$setValidity('exceedsThreshold', isValid);
    }
  }
};

export default customerThreshold;
