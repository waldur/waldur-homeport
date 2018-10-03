import template from './auth-valimo-trigger.html';

const authValimoTrigger = {
  template,
  bindings: {
    mode: '<',
  },
  controller: class AuthValimoTriggerController {
    // @ngInject
    constructor($uibModal, ENV) {
      this.$uibModal = $uibModal;
      this.provider = ENV.plugins.WALDUR_AUTH_VALIMO.LABEL;
    }

    showDialog() {
      this.$uibModal.open({
        component: 'authValimoDialog',
      });
    }
  }
};

export default authValimoTrigger;
