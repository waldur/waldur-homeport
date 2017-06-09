import template from './auth-saml2-dialog.html';

const authSaml2Dialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
  },
  controller: class AuthSaml2DialogController {
    // @ngInject
    constructor($sce, ENV, Saml2Service, ncUtilsFlash) {
      this.Saml2Service = Saml2Service;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.loginUrl = this.Saml2Service.getLoginUrl();
      this.initialized = false;
      this.providersLimit = 20;

      this.Saml2Service.getProviders().then(response => {
        this.providers = response.data;
        this.initialized = true;
      }).catch(() => {
        this.error = true;
        this.ncUtilsFlash.error(gettext('Could not load a list of identity providers. Please try again.'));
      });
    }

    isProviderSelected() {
      return !!this.provider;
    }
  }
};

export default authSaml2Dialog;
