import * as ResourceSummary from '@waldur/resource/summary/registry';

import openstackBackupScheduleWarning from './BackupScheduleWarning';
import './breadcrumbs';
import { OpenStackBackupScheduleSummary } from './OpenStackBackupScheduleSummary';
import './tabs';
import './actions';

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.BackupSchedule',
    {
      error_states: ['error'],
    },
  );
}

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.BackupSchedule',
    OpenStackBackupScheduleSummary,
  );
  module.component(
    'openstackBackupScheduleWarning',
    openstackBackupScheduleWarning,
  );
  module.config(stateConfig);
};
