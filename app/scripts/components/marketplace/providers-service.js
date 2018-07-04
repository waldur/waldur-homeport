export default class providersService {
  // @ngInject
  constructor($http, ENV) {
    this.$http = $http;
    this.ENV = ENV;
  }

  get endpoint() {
    return `${this.ENV.apiEndpoint}api/marketplace-service-providers/`;
  }

  register(customer) {
    return this.$http.post(this.endpoint, {
      customer: customer.url,
      enable_notifications: false,
    });
  }
}
