import template from './event-details-dialog.html';

export const eventDetailsDialog = {
  template,
  controller: class EventDetailsDialogController {
    $onInit() {
      this.event = this.resolve.event;
    }
  },
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  }
};
