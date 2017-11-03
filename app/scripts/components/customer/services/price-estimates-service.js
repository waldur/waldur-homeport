export default class PriceEstimatesService {
  // @ngInject
  constructor($http, ENV) {
    this.$http = $http;
    this.endpoint = ENV.apiEndpoint + 'api/price-estimates/';
  }

  isHardLimit(billing_price_estimate) {
    return billing_price_estimate.limit > 0 && billing_price_estimate.limit === billing_price_estimate.threshold;
  }

  update(billing_price_estimate) {
    return this.$http.put(billing_price_estimate.url, {
      threshold: billing_price_estimate.threshold,
      limit: billing_price_estimate.limit,
    });
  }
}
