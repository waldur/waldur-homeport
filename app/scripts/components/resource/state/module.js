import ResourceStateConfiguration from './resource-state-configuration';
import resourceStateService from './resource-state-service';
import resourceState from './resource-state';
import resourceStateMonitoring from './resource-state-monitoring';
import resourceStateBackup from './resource-state-backup';

export default module => {
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.service('resourceStateService', resourceStateService);
  module.component('resourceState', resourceState);
  module.component('resourceStateMonitoring', resourceStateMonitoring);
  module.component('resourceStateBackup', resourceStateBackup);
};
