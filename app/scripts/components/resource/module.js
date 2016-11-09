import resourceUtils from './resource-utils-service';
import resourceDetails from './resource-details';
import resourceEvents from './resource-events';

export default module => {
  module.service('resourceUtils', resourceUtils);
  module.directive('resourceDetails', resourceDetails);
  module.directive('resourceEvents', resourceEvents);
}
