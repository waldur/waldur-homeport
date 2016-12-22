import aboutRoutes from './about';
import errorRoutes from './errors';
import helpRoutes from './help';
import paymentRoutes from './payments';
import planRoutes from './plans';

// This module is temporary.
// It will be removed when all these routes go into their own modules
export default module => {
  module.config(aboutRoutes);
  module.config(errorRoutes);
  module.config(helpRoutes);
  module.config(paymentRoutes);
  module.config(planRoutes);
};
