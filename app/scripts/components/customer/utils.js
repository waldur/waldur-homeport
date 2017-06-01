export default class customerUtils {
  // ngInit
  constructor(priceEstimatesService) {
    this.priceEstimatesService = priceEstimatesService;
  }
  isHardLimit(price_estimate) {
    return price_estimate.limit > 0 && price_estimate.limit === price_estimate.threshold;
  }
  saveLimit(isHardLimit, customer) {
    const limit = isHardLimit ? customer.price_estimate.threshold : -1;
    return this.priceEstimatesService.setLimit(customer.url, limit);
  }
  saveThreshold(customer) {
    return this.priceEstimatesService.setThreshold(customer.url, customer.price_estimate.threshold);
  }
}
