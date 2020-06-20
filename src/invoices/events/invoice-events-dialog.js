import { EventDetailsDialog } from '@waldur/events/EventDetailsDialog';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';

import template from './invoice-events-dialog.html';
import { loadEvents } from './utils';

const invoiceEventsDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<',
  },
  controller: class InvoiceEventsDialogController {
    $onInit() {
      this.loading = true;
      this.erred = false;
      loadEvents(this.resolve.item)
        .then((events) => (this.events = events))
        .catch(() => (this.erred = true))
        .finally(() => (this.loading = false));
    }

    showEventDetails(event) {
      this.close();
      store.dispatch(
        openModalDialog(EventDetailsDialog, {
          resolve: {
            event: event.original,
          },
        }),
      );
    }
  },
};

export default invoiceEventsDialog;
