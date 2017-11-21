export default class EventDialogsService {
  // @ngInject
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  eventTypes() {
    return this.$uibModal.open({
      component: 'eventTypesDialog',
    });
  }

  eventDetails(event) {
    this.$uibModal.open({
      component: 'eventDetailsDialog',
      resolve: {
        event: () => event
      }
    });
  }
}
