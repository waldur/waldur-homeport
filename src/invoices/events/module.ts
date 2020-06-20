import invoiceEventsDialog from './invoice-events-dialog';
import invoiceEventsToggle from './invoice-events-toggle';

export default (module) => {
  module.component('invoiceEventsDialog', invoiceEventsDialog);
  module.component('invoiceEventsToggle', invoiceEventsToggle);
};
