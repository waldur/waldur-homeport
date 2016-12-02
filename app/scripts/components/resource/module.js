import resourceUtils from './resource-utils-service';
import resourceDetails from './resource-details';
import resourceEvents from './resource-events';
import resourceState from './resource-state';
import ResourceStateConfiguration from './resource-state-configuration';

export default module => {
  module.service('resourceUtils', resourceUtils);
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.directive('resourceDetails', resourceDetails);
  module.directive('resourceEvents', resourceEvents);
  module.directive('resourceState', resourceState);
};
