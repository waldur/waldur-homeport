import ResourceStateConfiguration from './resource-state-configuration';
import resourceState from './ResourceState';
import resourceStateMonitoring from './resource-state-monitoring';
import resourceStateBackup from './resource-state-backup';

export default module => {
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.component('resourceState', resourceState);
  module.component('resourceStateMonitoring', resourceStateMonitoring);
  module.component('resourceStateBackup', resourceStateBackup);
};
