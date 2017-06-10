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

  getProviders(name) {
    let url = `${this.endpoint}providers/`;
    let params = {};
    if (name) {
      params.name = name;
    }
    return this.$http.get(url, {params});
  }
}
