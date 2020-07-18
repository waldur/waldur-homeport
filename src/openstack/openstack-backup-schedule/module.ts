import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
import { OpenStackBackupScheduleSummary } from './OpenStackBackupScheduleSummary';
import './tabs';
import './actions';

export default () => {
  ResourceSummary.register(
    'OpenStackTenant.BackupSchedule',
    OpenStackBackupScheduleSummary,
  );
  ResourceStateConfigurationProvider.register(
    'OpenStackTenant.BackupSchedule',
    {
      error_states: ['error'],
    },
  );
};
