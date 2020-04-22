import Axios from 'axios';

export default class ProvidersService {
  // @ngInject
  constructor(ENV) {
    this.ENV = ENV;
  }

  get endpoint() {
    return `${this.ENV.apiEndpoint}api/marketplace-service-providers/`;
  }

  register(customer) {
    return Axios.post(this.endpoint, {
      customer: customer.url,
      enable_notifications: false,
    });
  }
}
