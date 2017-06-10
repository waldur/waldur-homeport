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

      this.refreshChoices().then(() => {
        this.initialized = true;
      }).catch(() => {
        this.error = true;
        this.ncUtilsFlash.error(gettext('Could not load a list of identity providers. Please try again.'));
      });
    }

    refreshChoices(name) {
      return this.Saml2Service.getProviders(name).then(response => {
        this.providers = response.data;
      });
    }

    isProviderSelected() {
      return !!this.provider;
    }
  }
};

export default authSaml2Dialog;
