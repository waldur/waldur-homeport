import aboutRoutes from './about';
import errorRoutes from './errors';
import helpRoutes from './help';
import organizationRoutes from './organizations';
import paymentRoutes from './payments';
import planRoutes from './plans';
import projectRoutes from './projects';

// This module is temporary.
// It will be removed when all these routes go into their own modules
export default module => {
  module.config(aboutRoutes);
  module.config(errorRoutes);
  module.config(helpRoutes);
  module.config(organizationRoutes);
  module.config(paymentRoutes);
  module.config(planRoutes);
  module.config(projectRoutes);
}
