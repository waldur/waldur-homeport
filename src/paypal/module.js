import { connectAngularComponent } from '@waldur/store/connect';

import { InvoicesList } from './InvoicesList';
import paypalInvoicesService from './paypal-invoices-service';
import './events';

export default module => {
  module.service('paypalInvoicesService', paypalInvoicesService);
  module.component('paypalInvoicesList', connectAngularComponent(InvoicesList));
};
