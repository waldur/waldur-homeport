import template from './auth-saml2.html';

const authSaml2 = {
  template,
  bindings: {
    mode: '<',
  },
  controller: class AuthSaml2Controller {
    // @ngInject
    constructor(ENV, Saml2Service) {
      this.Saml2Service = Saml2Service;
      this.ENV = ENV;
    }

    $onInit(){
      this.providerLabel = this.ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL;
    }

    login() {
      return this.Saml2Service.login(this.ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL);
    }
  }
};

export default authSaml2;
