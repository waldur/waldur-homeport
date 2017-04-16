import openstackBackupSchedulesList from './openstack-backup-schedules-list';
import openstackBackupSchedulesService from './openstack-backup-schedules-service';
import openstackBackupScheduleSummary from './openstack-backup-schedule-summary';
import breadcrumbsConfig from './breadcrumbs';
import filtersModule from './filters';

export default module => {
  module.service('openstackBackupSchedulesService', openstackBackupSchedulesService);
  module.component('openstackBackupSchedulesList', openstackBackupSchedulesList);
  module.component('openstackBackupScheduleSummary', openstackBackupScheduleSummary);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(stateConfig);
  module.run(breadcrumbsConfig);
  filtersModule(module);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      'update',
      'activate',
      'deactivate',
      'destroy',
      'pull'
    ],
    options: {
      update: {
        title: gettext('Edit'),
        successMessage: gettext('Backup schedule has been updated'),
        fields: {
          schedule: {
            type: 'crontab'
          }
        }
      },
      pull: {
        title: gettext('Synchronise')
      },
    }
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    error_states: [
      'error'
    ]
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_SUBRESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      ...DEFAULT_SUBRESOURCE_TABS.order,
      'backups',
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      backups: {
        heading: gettext('Backups'),
        component: 'openstackBackupsList'
      },
    })
  });
}
