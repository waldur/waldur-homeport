export default class AppstoreOfferings {
  constructor($http, ENV) {
    this.$http = $http;
    this.ENV = ENV;
  }

  getConfiguration() {
    const endpoint = 'api/support-offerings/configured/';
    return this.$http.get(this.ENV.apiEndpoint + endpoint)
      .then(response => response.data);
  }

  createOffering(offering) {
    const endpoint = 'api/support-offerings/';
    return this.$http.post(this.ENV.apiEndpoint + endpoint, offering)
      .then(response => response.data);
  }
}
