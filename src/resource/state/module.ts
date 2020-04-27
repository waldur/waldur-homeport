import resourceStateBackup from './BackupState';
import resourceStateMonitoring from './MonitoringState';
import ResourceStateConfiguration from './resource-state-configuration';
import resourceState from './ResourceState';

export default module => {
  module.provider('ResourceStateConfiguration', ResourceStateConfiguration);
  module.component('resourceState', resourceState);
  module.component('resourceStateMonitoring', resourceStateMonitoring);
  module.component('resourceStateBackup', resourceStateBackup);
};
