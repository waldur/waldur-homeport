export default class Saml2Service {
  // @ngInject
  constructor(ENV, $http) {
    this.endpoint = `${ENV.apiEndpoint}api-auth/saml2/`;
    this.$http = $http;
  }

  getProviders() {
    let url = `${this.endpoint}providers/`;
    return this.$http.get(url);
  }
}
