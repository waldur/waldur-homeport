export default class EventDialogsService {
  // @ngInject
  constructor($uibModal, eventsService) {
    this.$uibModal = $uibModal;
    this.eventsService = eventsService;
  }

  eventTypes() {
    return this.$uibModal.open({
      component: 'eventTypesDialog',
      resolve: {
        type: () => 'Events',
        types: () => this.eventsService.getAvailableIconTypes()
      }
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
