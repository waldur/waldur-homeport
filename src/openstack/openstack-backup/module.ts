import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './breadcrumbs';
import openstackBackupRestoreSummary from './openstack-backup-restore-summary';
import { OpenStackBackupSummary } from './OpenStackBackupSummary';

import './tabs';

export default module => {
  ResourceSummary.register('OpenStackTenant.Backup', OpenStackBackupSummary);
  module.component(
    'openstackBackupRestoreSummary',
    openstackBackupRestoreSummary,
  );
  ActionConfigurationRegistry.register('OpenStackTenant.Backup', actions);
};
