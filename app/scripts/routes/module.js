import aboutRoutes from './about';
import helpRoutes from './help';
import paymentRoutes from './payments';

// This module is temporary.
// It will be removed when all these routes go into their own modules
export default module => {
  module.config(aboutRoutes);
  module.config(helpRoutes);
  module.config(paymentRoutes);
};
