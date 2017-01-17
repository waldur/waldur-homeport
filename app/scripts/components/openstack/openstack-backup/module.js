import openstackBackupsService from './openstack-backups-service';
import openstackBackupsList from './openstack-backups-list';
import backupSnapshotsList from './backup-snapshots-list';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.config(actionConfig);
  module.config(tabsConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      'edit',
      'restore',
      'destroy',
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
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'snapshots',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: 'Snapshots',
        component: 'backupSnapshotsList'
      },
    })
  });
}
