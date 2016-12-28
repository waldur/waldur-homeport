import openstackBackupsService from '../openstack-backup/openstack-backups-service';
import openstackSnapshotsService from '../openstack-backup/openstack-snapshots-service';
import openstackBackupsList from '../openstack-backup/openstack-backups-list';
import backupSnapshotsList from '../openstack-backup/backup-snapshots-list';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.service('openstackSnapshotsService', openstackSnapshotsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.config(actionConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      'edit'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Backup has been updated',
        fields: {
          kept_until: {
            help_text: 'Guaranteed time of backup retention. If null - keep forever.',
            label: 'Kept until',
            required: false,
            type: 'datetime'
          }
        }
      })
    }
  });

  ActionConfigurationProvider.register('OpenStackTenant.Snapshot', {
    order: [
      'edit'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Snapshot has been updated'
      })
    }
  });
}
