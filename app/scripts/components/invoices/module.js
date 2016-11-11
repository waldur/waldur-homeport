import invoiceDetails from './invoice-details';
import InvoicesListController from './invoices-list';
import invoicesService from './invoices-service';

export default module => {
  module.directive('invoiceDetails', invoiceDetails);
  module.controller('InvoicesListController', InvoicesListController);
  module.service('invoicesService', invoicesService);
}
