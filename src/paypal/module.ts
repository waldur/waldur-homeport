import paymentRoutes from './routes';
import './events';

export default module => {
  module.config(paymentRoutes);
};
