import aboutRoutes from './about';

// This module is temporary.
// It will be removed when all these routes go into their own modules
export default module => {
  module.config(aboutRoutes);
};
