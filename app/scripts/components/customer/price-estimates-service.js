// @ngInject
export default class PriceEstimatesService {
  constructor($http, ENV) {
    this.$http = $http;
    this.endpoint = ENV.apiEndpoint + 'api/price-estimates/';
  }
  setThreshold(scope_url, value) {
    return this.$http.post(this.endpoint + 'threshold/', {
      threshold: value,
      scope: scope_url
    });
  }
  setLimit(scope_url, value) {
    return this.$http.post(this.endpoint + 'limit/', {
      limit: value,
      scope: scope_url
    });
  }
}
