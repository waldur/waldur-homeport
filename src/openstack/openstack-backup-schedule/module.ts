import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './breadcrumbs';
import './tabs';
const OpenStackBackupScheduleSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackBackupScheduleSummary" */ './OpenStackBackupScheduleSummary'
    ),
  'OpenStackBackupScheduleSummary',
);

export default () => {
  ActionConfigurationRegistry.register(
    'OpenStackTenant.BackupSchedule',
    actions,
  );
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
