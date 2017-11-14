import template from './auth-valimo-trigger.html';

const authValimoTrigger = {
  template,
  bindings: {
    mode: '<',
  },
  controller: class AuthValimoTriggerController {
    // @ngInject
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    showDialog() {
      this.$uibModal.open({
        component: 'authValimoDialog',
      });
    }
  }
};

export default authValimoTrigger;
