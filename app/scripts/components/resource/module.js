import resourceUtils from './resource-utils-service';
import resourceDetails from './resource-details';
import resourceEvents from './resource-events';
import resourceRoutes from './routes';

export default module => {
  module.service('resourceUtils', resourceUtils);
  module.directive('resourceDetails', resourceDetails);
  module.directive('resourceEvents', resourceEvents);
  module.config(resourceRoutes);
}
