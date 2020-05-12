import eventsModule from './events/module';
import billingRoutes from './routes';
import './events';

export default module => {
  module.config(billingRoutes);
  eventsModule(module);
};
