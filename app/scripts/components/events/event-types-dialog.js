const eventTypesDialog = {
  template: '<types-list-dialog types="$ctrl.types" dialog-title="$ctrl.title" dismiss="$ctrl.dismiss()"/>',
  bindings: {
    dismiss: '&'
  },
  controller: class EventTypesDialog {
    // @ngInject
    constructor(eventsService) {
      this.eventsService = eventsService;
    }
    $onInit() {
      this.title = gettext('Event types');
      this.types = this.eventsService.getAvailableIconTypes();
    }
  }
};

export default eventTypesDialog;
