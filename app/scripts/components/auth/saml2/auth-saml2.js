import template from './auth-saml2.html';

const authSaml2 = {
  template,
  bindings: {
    mode: '<',
  },
  controller: class AuthSaml2Controller {
    // @ngInject
    constructor(ENV, coreUtils, Saml2Service) {
      this.Saml2Service = Saml2Service;
      this.ENV = ENV;
      this.coreUtils = coreUtils;
    }

    $onInit(){
      this.provider = this.ENV.SAML2_IDENTITY_PROVIDER;
      this.providerLabel = this.ENV.SAML2_LABEL;
      this.loginUrl = this.Saml2Service.getLoginUrl();
    }
  }
};

export default authSaml2;
