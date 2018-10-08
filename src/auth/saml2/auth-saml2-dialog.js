import template from './auth-saml2-dialog.html';

const authSaml2Dialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
  },
  controller: class AuthSaml2DialogController {
    // @ngInject
    constructor(Saml2Service, ncUtilsFlash, $rootScope) {
      this.Saml2Service = Saml2Service;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.initialized = false;

      this.$rootScope.$broadcast('enableRequests');
      this.refreshChoices().catch(() => {
        this.error = true;
        this.ncUtilsFlash.error(gettext('Could not load a list of identity providers. Please try again.'));
      }).finally(() => {
        this.initialized = true;
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

    login() {
      return this.Saml2Service.login(this.provider.url);
    }
  }
};

export default authSaml2Dialog;
