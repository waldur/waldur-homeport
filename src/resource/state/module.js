import ResourceStateConfiguration from './resource-state-configuration';
import resourceState from './ResourceState';
import resourceStateMonitoring from './MonitoringState';
import resourceStateBackup from './BackupState';

export default module => {
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.component('resourceState', resourceState);
  module.component('resourceStateMonitoring', resourceStateMonitoring);
  module.component('resourceStateBackup', resourceStateBackup);
};
