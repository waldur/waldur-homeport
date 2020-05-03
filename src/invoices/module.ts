import eventsModule from './events/module';
import invoicesService from './invoices-service';
import billingRoutes from './routes';
import './events';

export default module => {
  module.service('invoicesService', invoicesService);
  module.config(billingRoutes);
  eventsModule(module);
};
