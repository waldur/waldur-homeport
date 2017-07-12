export default class expertsService {
  // @ngInject
  constructor($http, ENV) {
    this.$http = $http;
    this.ENV = ENV;
  }

  get endpoint() {
    return `${this.ENV.apiEndpoint}api/expert-providers/`;
  }

  register(customer) {
    return this.$http.post(this.endpoint, {
      customer: customer.url,
      agree_with_policy: true,
    });
  }

  getByCustomer(customer) {
    return this.$http.get(this.endpoint, {
      params: {
        customer_uuid: customer.uuid
      }
    });
  }
}
