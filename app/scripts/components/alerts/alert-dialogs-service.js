export default class AlertDialogsService {
  // @ngInject
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  alertTypes() {
    this.$uibModal.open({
      component: 'alertTypesDialog',
    });
  }
}
