import openStackBackupSchedulesList from './openstack-backup-schedules-list';
import openStackBackupSchedulesService from './openstack-backup-schedules-service';
import backupScheduleBackupsList from './backup-schedules-backups-list';
import openstackBackupScheduleSummary from './openstack-backup-schedule-summary';

export default module => {
  module.service('openStackBackupSchedulesService', openStackBackupSchedulesService);
  module.directive('openStackBackupSchedulesList', openStackBackupSchedulesList);
  module.directive('backupScheduleBackupsList', backupScheduleBackupsList);
  module.component('openstackBackupScheduleSummary', openstackBackupScheduleSummary);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(stateConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      'edit',
      'activate',
      'deactivate',
      'destroy',
      'pull'
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: 'Backup schedule has been updated'
      }),
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
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      'backups',
    ],
    options: {
      backups: {
        heading: 'Backups',
        component: 'backupScheduleBackupsList'
      },
    }
  });
}
