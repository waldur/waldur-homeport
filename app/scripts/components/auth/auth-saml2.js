import template from './auth-saml2.html';

const authSaml2 = {
  template,
  controller: class AuthSaml2Controller {
    constructor($sce, ENV, coreUtils) {
      const callbackUrl = 'api-auth/saml2/login/';
      this.loginUrl = $sce.trustAsResourceUrl(ENV.apiEndpoint + callbackUrl);
      this.provider = ENV.SAML2_IDENTITY_PROVIDER;

      this.buttonLabel = coreUtils.templateFormatter(gettext('Sign in with {provider}'), {
        provider: ENV.SAML2_LABEL
      });
    }
  }
};

export default authSaml2;
