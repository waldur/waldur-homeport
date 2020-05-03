import paypalInvoicesService from './paypal-invoices-service';
import paymentRoutes from './routes';
import './events';

export default module => {
  module.service('paypalInvoicesService', paypalInvoicesService);
  module.config(paymentRoutes);
};
