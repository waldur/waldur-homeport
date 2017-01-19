import invoiceDetails from './invoice-details';
import { invoicesList } from './invoices-list';
import invoicesService from './invoices-service';

export default module => {
  module.directive('invoiceDetails', invoiceDetails);
  module.component('invoicesList', invoicesList);
  module.service('invoicesService', invoicesService);
};
