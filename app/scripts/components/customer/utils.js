export default class customerUtils {
  // @ngInit
  constructor(priceEstimatesService, customersService) {
    this.priceEstimatesService = priceEstimatesService;
    this.customersService = customersService;
  }
  isHardLimit(price_estimate) {
    return price_estimate.limit > 0 && price_estimate.limit === price_estimate.threshold;
  }
  saveLimit(customer, limit) {
    return this.priceEstimatesService.setLimit(customer.url, limit).then(() => {
      customer.price_estimate.limit = limit;
    });
  }
  saveThreshold(customer, threshold) {
    return this.priceEstimatesService.setThreshold(customer.url, threshold).then(() => {
      customer.price_estimate.threshold = threshold;
    });
  }
}
