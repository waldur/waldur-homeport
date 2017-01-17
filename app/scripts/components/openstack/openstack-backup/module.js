import openstackBackupsService from './openstack-backups-service';
import openstackBackupsList from './openstack-backups-list';
import backupSnapshotsList from './backup-snapshots-list';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.directive('backupSnapshotsList', backupSnapshotsList);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(breadcrumbsConfig);
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

// @ngInject
function breadcrumbsConfig(ResourceBreadcrumbsConfigurationProvider) {
  ResourceBreadcrumbsConfigurationProvider.register('OpenStackTenant.Backup', resource => ([
    {
      label: 'Virtual machines',
      state: 'project.resources.vms',
      params: {
        uuid: resource.project_uuid
      }
    },
    {
      label: resource.instance_name,
      state: 'resources.details',
      params: {
        uuid: resource.instance_uuid,
        resource_type: 'OpenStackTenant.Instance'
      }
    },
    {
      label: 'Backups',
      state: 'resources.details',
      params: {
        uuid: resource.instance_uuid,
        resource_type: 'OpenStackTenant.Instance',
        tab: 'backups'
      }
    },
  ]));
}
