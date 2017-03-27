import openstackBackupsService from './openstack-backups-service';
import openstackBackupsList from './openstack-backups-list';
import { openstackBackupSummary } from './openstack-backup-summary';
import backupSnapshotsList from './backup-snapshots-list';
import openstackBackupRestoreSummary from './openstack-backup-restore-summary';
import actionsConfig from './actions';
import tabsConfig from './tabs';
import breadcrumbsConfig from './breadcrumbs';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.component('openstackBackupSummary', openstackBackupSummary);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.component('openstackBackupRestoreSummary', openstackBackupRestoreSummary);
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};
