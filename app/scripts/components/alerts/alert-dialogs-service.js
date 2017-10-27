export default class AlertDialogsService {
  // @ngInject
  constructor($uibModal, alertsService) {
    this.$uibModal = $uibModal;
    this.alertsService = alertsService;
  }

  alertTypes() {
    this.$uibModal.open({
      component: 'eventTypesDialog',
      resolve: {
        type: () => 'Alerts',
        types: () => this.alertsService.getAvailableIconTypes()
      }
    });
  }
}
