import openstackBackupsService from './openstack-backups-service';
import openstackBackupsList from './openstack-backups-list';
import backupSnapshotsList from './backup-snapshots-list';
import openstackBackupRestoreSummary from './openstack-backup-restore-summary';
import actions from './actions';
import tabsConfig from './tabs';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackBackupSummary } from './OpenStackBackupSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStackTenant.Backup', OpenStackBackupSummary);
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.component('openstackBackupRestoreSummary', openstackBackupRestoreSummary);
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', actions);
}
