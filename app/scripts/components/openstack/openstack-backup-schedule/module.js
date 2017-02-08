import openStackBackupSchedulesList from './openstack-backup-schedules-list';
import openStackBackupSchedulesService from './openstack-backup-schedules-service';
import backupScheduleBackupsList from './backup-schedules-backups-list';
import openstackBackupScheduleSummary from './openstack-backup-schedule-summary';

export default module => {
  module.service('openStackBackupSchedulesService', openStackBackupSchedulesService);
  module.component('openStackBackupSchedulesList', openStackBackupSchedulesList);
  module.component('backupScheduleBackupsList', backupScheduleBackupsList);
  module.component('openstackBackupScheduleSummary', openstackBackupScheduleSummary);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(stateConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
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
        title: 'Edit',
        successMessage: 'Backup schedule has been updated',
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
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'backups',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      backups: {
        heading: 'Backups',
        component: 'backupScheduleBackupsList'
      },
    })
  });
}
