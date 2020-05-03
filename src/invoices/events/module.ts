import invoiceEventsDialog from './invoice-events-dialog';
import InvoiceEventsService from './invoice-events-service';
import invoiceEventsToggle from './invoice-events-toggle';

export default module => {
  module.service('InvoiceEventsService', InvoiceEventsService);
  module.component('invoiceEventsDialog', invoiceEventsDialog);
  module.component('invoiceEventsToggle', invoiceEventsToggle);
};
