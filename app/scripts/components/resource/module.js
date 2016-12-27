import resourceUtils from './resource-utils-service';
import resourceDetails from './resource-details';
import resourceEvents from './resource-events';
import resourceRoutes from './routes';
import resourceState from './resource-state';
import ResourceStateConfiguration from './resource-state-configuration';
import {ResourceFieldConfiguration} from './resource-field-configuration';
import resourceIssues from './resource-issues';

export default module => {
  module.service('resourceUtils', resourceUtils);
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.directive('resourceDetails', resourceDetails);
  module.directive('resourceEvents', resourceEvents);
  module.directive('resourceState', resourceState);
  module.directive('resourceIssues', resourceIssues);
  module.config(resourceRoutes);
  module.constant('RESOURCE_FIELDS_CONFIG', ResourceFieldConfiguration);
};
