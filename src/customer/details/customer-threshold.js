import { PriceEstimatesService } from '../services/PriceEstimatesService';

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
    constructor(ENV) {
      this.currency = ENV.currency;
    }

    $onInit() {
      this.model.isHardLimit = PriceEstimatesService.isHardLimit(
        this.model.priceEstimate,
      );
      this.updateLimit();
    }

    updateLimit() {
      this.model.priceEstimate.limit = this.model.isHardLimit
        ? this.model.priceEstimate.threshold
        : -1;
    }

    thresholdChanged() {
      this.validateThreshold();
      this.updateLimit();
    }

    validateThreshold() {
      const isValid =
        this.model.priceEstimate.threshold >= this.model.priceEstimate.total;
      this.thresholdForm.threshold.$setValidity('exceedsThreshold', isValid);
    }
  },
};

export default customerThreshold;
