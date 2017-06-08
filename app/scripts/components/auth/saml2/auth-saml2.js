import template from './auth-saml2.html';

const authSaml2 = {
  template,
  controller: class AuthSaml2Controller {
    constructor($uibModal, coreUtils, ENV) {
      this.$uibModal = $uibModal;
      this.buttonLabel = coreUtils.templateFormatter(gettext('Sign in with {provider}'), {
        provider: ENV.SAML2_LABEL
      });
    }

    selectProvider() {
      this.$uibModal.open({
        component: 'authSaml2Dialog',
      });
    }
  }
};

export default authSaml2;
