import invoiceEventsDialog from './invoice-events-dialog';
import invoiceEventsToggle from './invoice-events-toggle';
import InvoiceEventsService from './invoice-events-service';

export default module => {
  module.service('InvoiceEventsService', InvoiceEventsService);
  module.component('invoiceEventsDialog', invoiceEventsDialog);
  module.component('invoiceEventsToggle', invoiceEventsToggle);
};
