import resourceUtils from './resource-utils-service';
import resourceDetails from './resource-details';
import resourceEvents from './resource-events';
import resourceRoutes from './routes';
import resourceState from './resource-state';
import ResourceStateConfiguration from './resource-state-configuration';
import ResourceFieldConfiguration from './resource-field-configuration';
import resourceIssues from './resource-issues';

export default module => {
  module.service('resourceUtils', resourceUtils);
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.provider('ResourceFieldConfiguration', ResourceFieldConfiguration);
  module.directive('resourceDetails', resourceDetails);
  module.directive('resourceEvents', resourceEvents);
  module.directive('resourceState', resourceState);
  module.directive('resourceIssues', resourceIssues);
  module.config(resourceRoutes);
  module.config(stateConfig);
};

// @ngInject
function stateConfig(ResourceFieldConfigurationProvider) {
  ResourceFieldConfigurationProvider.register('datetime', {
    format: 'dd.MM.yyyy',
    altInputFormats: ['M!/d!/yyyy'],
    dateOptions: {
      minDate: new Date(),
      startingDay: 1
    }
  });
}
