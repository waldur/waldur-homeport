import ResourceStateConfiguration from './resource-state-configuration';
import resourceStateService from './resource-state-service';
import resourceState from './resource-state';

export default module => {
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.service('resourceStateService', resourceStateService);
  module.component('resourceState', resourceState);
};
