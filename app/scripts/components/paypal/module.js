import paypalInvoiceState from './paypal-invoice-state';
import paypalInvoicesList from './paypal-invoices-list';
import paypalInvoicesService from './paypal-invoices-service';
import paypalInvoiceActions from './paypal-invoice-actions';
import './events';

export default module => {
  module.service('paypalInvoicesService', paypalInvoicesService);
  module.component('paypalInvoiceActions', paypalInvoiceActions);
  module.component('paypalInvoiceState', paypalInvoiceState);
  module.component('paypalInvoicesList', paypalInvoicesList);
};
