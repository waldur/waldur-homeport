import template from './auth-saml2-trigger.html';

const authSaml2Trigger = {
  template,
  controller: class AuthSaml2TriggerController {
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    selectProvider() {
      this.$uibModal.open({
        component: 'authSaml2Dialog',
      });
    }
  }
};

export default authSaml2Trigger;
