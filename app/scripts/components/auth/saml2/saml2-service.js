export default class Saml2Service {
  // @ngInject
  constructor(ENV, $http, $sce) {
    this.endpoint = `${ENV.apiEndpoint}api-auth/saml2/`;
    this.$http = $http;
    this.$sce = $sce;
  }

  getLoginUrl() {
    return this.$sce.trustAsResourceUrl(`${this.endpoint}login/`);
  }

  getProviders() {
    let url = `${this.endpoint}providers/`;
    return this.$http.get(url);
  }
}
