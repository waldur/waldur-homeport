import template from './auth-saml2.html';

const authSaml2 = {
  template,
  controller: class AuthSaml2Controller {
    constructor(ENV, coreUtils, saml2Service) {
      this.loginUrl = saml2Service.getLoginUrl();
      this.provider = ENV.SAML2_IDENTITY_PROVIDER;

      this.buttonLabel = coreUtils.templateFormatter(gettext('Sign in with {provider}'), {
        provider: ENV.SAML2_LABEL
      });
    }
  }
};

export default authSaml2;
