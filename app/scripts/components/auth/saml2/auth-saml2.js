import template from './auth-saml2.html';

const authSaml2 = {
  template,
  controller: class AuthSaml2Controller {
    constructor(ENV, coreUtils, Saml2Service) {
      this.Saml2Service = Saml2Service;
      this.ENV = ENV;
      this.coreUtils = coreUtils;
    }

    $onInit(){
      this.provider = this.ENV.SAML2_IDENTITY_PROVIDER;
      this.loginUrl = this.Saml2Service.getLoginUrl();
      this.buttonLabel = this.coreUtils.templateFormatter(gettext('Sign in with {provider}'), {
        provider: this.ENV.SAML2_LABEL
      });
    }
  }
};

export default authSaml2;
