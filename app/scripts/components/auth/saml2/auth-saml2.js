import template from './auth-saml2.html';

const authSaml2 = {
  template,
  controller: class AuthSaml2Controller {
    constructor(ENV, coreUtils, saml2Service) {
      this.saml2Service = saml2Service;
      this.ENV = ENV;
      this.coreUtils = coreUtils;
    }

    $onInit(){
      this.provider = this.ENV.SAML2_IDENTITY_PROVIDER;
      this.loginUrl = this.saml2Service.getLoginUrl();
      this.buttonLabel = this.coreUtils.templateFormatter(gettext('Sign in with {provider}'), {
        provider: this.ENV.SAML2_LABEL
      });
    }
  }
};

export default authSaml2;
