import template from './auth-saml2-trigger.html';

const authSaml2Trigger = {
  template,
  bindings: {
    mode: '<',
  },
  controller: class AuthSaml2TriggerController {
    // @ngInject
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
