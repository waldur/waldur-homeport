import openstackBackupSchedulesList from './openstack-backup-schedules-list';
import openstackBackupSchedulesService from './openstack-backup-schedules-service';
import breadcrumbsConfig from './breadcrumbs';
import { OpenStackBackupScheduleSummary } from './OpenStackBackupScheduleSummary';
import openstackBackupScheduleWarning from './BackupScheduleWarning';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('OpenStackTenant.BackupSchedule', OpenStackBackupScheduleSummary);
  module.service('openstackBackupSchedulesService', openstackBackupSchedulesService);
  module.component('openstackBackupSchedulesList', openstackBackupSchedulesList);
  module.component('openstackBackupScheduleWarning', openstackBackupScheduleWarning);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.config(stateConfig);
  module.run(breadcrumbsConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.BackupSchedule', {
    order: [
      'update',
      'activate',
      'deactivate',
      'destroy'
    ],
    options: {
      update: {
        title: gettext('Edit'),
        successMessage: gettext('Backup schedule has been updated'),
        fields: {
          schedule: {
            type: 'crontab',
          },
          timezone: {
            type: 'timezone',
          },
          warning: {
            component: 'openstackBackupScheduleWarning',
          },
        },
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
      'backups',
      ...DEFAULT_SUBRESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_SUBRESOURCE_TABS.options, {
      backups: {
        heading: gettext('Backups'),
        component: 'openstackBackupsList'
      },
    })
  });
}
