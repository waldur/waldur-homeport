import template from './auth-saml2-dialog.html';

const authSaml2Dialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
  },
  controller: class AuthSaml2DialogController {
    // @ngInject
    constructor($sce, ENV, saml2Service, ncUtilsFlash) {
      this.saml2Service = saml2Service;
      this.initialized = false;
      this.providersLimit = 100;
      this.ncUtilsFlash = ncUtilsFlash;

      const callbackUrl = 'api-auth/saml2/login/';
      this.loginUrl = $sce.trustAsResourceUrl(ENV.apiEndpoint + callbackUrl);
    }

    $onInit() {
      this.saml2Service.getProviders().then(response => {
        this.providers = response.data;
        this.initialized = true;
      }).catch(() => {
        this.error = true;
        this.ncUtilsFlash(gettext('Could not load a list of providers. Please try again.'));
      });
    }
  }
};

export default authSaml2Dialog;
