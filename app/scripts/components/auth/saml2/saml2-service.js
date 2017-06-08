export default class Saml2Service {
  // @ngInject
  constructor(ENV, $http, $sce) {
    this.endpoint = `${ENV.apiEndpoint}api-auth/saml2/`;
    this.$http = $http;

    const callbackUrl = 'api-auth/saml2/login/';
    this.loginUrl = $sce.trustAsResourceUrl(ENV.apiEndpoint + callbackUrl);
  }

  getLoginUrl() {
    return this.loginUrl;
  }

  getProviders() {
    let url = `${this.endpoint}providers/`;
    return this.$http.get(url);
  }
}
