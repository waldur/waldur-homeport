import openstackBackupsService from './openstack-backups-service';
import openstackBackupsList from './openstack-backups-list';
import backupSnapshotsList from './backup-snapshots-list';
import actionsConfig from './actions';
import tabsConfig from './tabs';
import breadcrumbsConfig from './breadcrumbs';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};
