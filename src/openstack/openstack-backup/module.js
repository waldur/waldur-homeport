import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import openstackBackupsList from './BackupsList';
import backupSnapshotsList from './BackupSnapshotsList';
import breadcrumbsConfig from './breadcrumbs';
import openstackBackupRestoreSummary from './openstack-backup-restore-summary';
import openstackBackupsService from './openstack-backups-service';
import { OpenStackBackupSummary } from './OpenStackBackupSummary';
import tabsConfig from './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', actions);
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Backup', OpenStackBackupSummary);
  module.service('openstackBackupsService', openstackBackupsService);
  module.component('openstackBackupsList', openstackBackupsList);
  module.component('backupSnapshotsList', backupSnapshotsList);
  module.component(
    'openstackBackupRestoreSummary',
    openstackBackupRestoreSummary,
  );
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};
